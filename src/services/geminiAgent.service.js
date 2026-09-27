// src/services/geminiAgent.service.js
// The AI Simulation Agent: Gemini decides which tools to call; the tools themselves
// are the pure deterministic functions from twinBuilder / scenario / simulationEngine / impact.

const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
require("dotenv").config();

const { getItemDetail, getTwinState, getTwinSummary } = require("./twinBuilder.service");
const { applyScenario } = require("./scenario.service");
const { simulateForward } = require("./simulationEngine.service");
const { computeImpact } = require("./impact.service");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- 1. Tool schemas Gemini will see ----

const toolDeclarations = [
  {
    name: "get_twin_summary",
    description:
      "Returns a compact summary of the current ERP digital twin state: item count, items at/below reorder point, open PO/SO counts.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: "get_item_detail",
    description:
      "Returns full detail for a single item by SKU: stock on hand, incoming qty, pending demand, avg daily demand.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: { sku: { type: SchemaType.STRING, description: "The item SKU to look up" } },
      required: ["sku"],
    },
  },
  {
    name: "run_scenario_simulation",
    description:
      "Applies a hypothetical scenario to the current twin state, simulates forward, and returns the impact vs. the baseline (no scenario). This is the core 'what-if' tool.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        scenario_type: {
          type: SchemaType.STRING,
          enum: ["supplier_delay", "demand_spike", "stock_adjustment", "lead_time_change"],
        },
        vendor_id: { type: SchemaType.STRING },
        sku: { type: SchemaType.STRING },
        delay_days: { type: SchemaType.NUMBER },
        demand_multiplier: { type: SchemaType.NUMBER },
        stock_delta: { type: SchemaType.NUMBER },
        horizon_days: { type: SchemaType.NUMBER, description: "How many days forward to simulate. Default 30." },
      },
      required: ["scenario_type"],
    },
  },
];

// ---- 2. Tool dispatcher: executes whichever function Gemini requested ----

async function executeTool(name, args) {
  switch (name) {
    case "get_twin_summary":
      return getTwinSummary();

    case "get_item_detail":
      return getItemDetail(args.sku);

    case "run_scenario_simulation": {
      const baseState = await getTwinState();
      const horizon = args.horizon_days ?? 30;

      const scenario = {
        scenario_type: args.scenario_type,
        vendor_id: args.vendor_id,
        sku: args.sku,
        delay_days: args.delay_days,
        demand_multiplier: args.demand_multiplier,
        stock_delta: args.stock_delta,
      };

      const scenarioState = applyScenario(baseState, scenario);

      const baselineResult = simulateForward(baseState, horizon);
      const scenarioResult = simulateForward(scenarioState, horizon);

      const impact = computeImpact(baselineResult, scenarioResult);

      return { baseline: baselineResult, scenario: scenarioResult, impact };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ---- 3. The agent loop ----

async function runSimulationAgent(userQuestion) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ functionDeclarations: toolDeclarations }],
    systemInstruction: `You are an ERP simulation agent. You answer "what-if" questions about
company operations by calling tools that read the digital twin and run deterministic simulations.
Never invent numbers yourself — always call a tool to get real data. After tool results come back,
explain what would happen and why, in plain language for a manager.`,
  });

  const chat = model.startChat();
  let result = await chat.sendMessage(userQuestion);

  // Keep executing tool calls until Gemini returns a plain text answer
  while (true) {
    const call = result.response.functionCalls()?.[0];
    if (!call) break;

    const toolResult = await executeTool(call.name, call.args);

    result = await chat.sendMessage([
      {
        functionResponse: {
          name: call.name,
          response: toolResult,
        },
      },
    ]);
  }

  return result.response.text();
}

module.exports = { runSimulationAgent };