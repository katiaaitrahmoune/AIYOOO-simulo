// src/services/geminiAgent.service.js
// Layer 2: AI Simulation Agent
//
// Gemini decides which tool to call.
// The actual ERP data comes from Layer 1: snapshotService.js
// Simulation/scenario/impact logic remains deterministic.

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

import {
  buildSnapshot,
  getItemsSnapshot,
  getOpenPurchaseOrders,
  getOpenSalesOrders,
  getSuppliers,
} from "./snapshotService.js";

import { applyScenario } from "./scenario.service.js";
import { simulateForward } from "./simulationEngine.service.js";
import { computeImpact } from "./impact.service.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// 1. Helper functions using the REAL ERP snapshot
// ============================================================

async function getTwinState(enterpriseId) {
  return await buildSnapshot(enterpriseId);
}

async function getTwinSummary(enterpriseId) {
  const snapshot = await buildSnapshot(enterpriseId);

  const itemsAtOrBelowReorderPoint = snapshot.items.filter(
    (item) =>
      item.reorder_point !== null &&
      item.quantity_on_hand <= item.reorder_point
  );

  return {
    snapshot_timestamp: snapshot.snapshot_timestamp,

    total_items: snapshot.items.length,

    items_at_or_below_reorder_point:
      itemsAtOrBelowReorderPoint.length,

    open_purchase_orders: snapshot.open_purchase_orders.length,

    open_sales_orders: snapshot.open_sales_orders.length,

    suppliers: snapshot.suppliers.length,

    low_stock_items: itemsAtOrBelowReorderPoint.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity_on_hand: item.quantity_on_hand,
      reorder_point: item.reorder_point,
    })),
  };
}

async function getItemDetail(enterpriseId, sku) {
  const snapshot = await buildSnapshot(enterpriseId);

  const item = snapshot.items.find(
    (item) => item.sku.toLowerCase() === sku.toLowerCase()
  );

  if (!item) {
    return {
      found: false,
      sku,
      message: `No item with SKU "${sku}" was found in the ERP snapshot.`,
    };
  }

  const relatedPurchaseOrders = snapshot.open_purchase_orders.filter(
    (po) => po.item_sku.toLowerCase() === sku.toLowerCase()
  );

  const relatedSalesOrders = snapshot.open_sales_orders.filter(
    (so) => so.item_sku.toLowerCase() === sku.toLowerCase()
  );

  return {
    found: true,

    item,

    open_purchase_orders: relatedPurchaseOrders,

    open_sales_orders: relatedSalesOrders,

    total_incoming_qty: relatedPurchaseOrders.reduce(
      (sum, po) => sum + po.qty_ordered - po.qty_received,
      0
    ),

    total_pending_demand: relatedSalesOrders.reduce(
      (sum, so) => sum + so.qty_ordered - so.qty_fulfilled,
      0
    ),
  };
}

// ============================================================
// 2. Tool schemas Gemini will see
// ============================================================

const toolDeclarations = [
  {
    name: "get_twin_summary",

    description:
      "Returns a compact summary of the current ERP digital twin state. " +
      "Use this when the user asks about the overall inventory situation, " +
      "low-stock items, open purchase orders, open sales orders, or suppliers.",

    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },

  {
    name: "get_item_detail",

    description:
      "Returns detailed ERP information for a single item by SKU, including " +
      "stock on hand, reorder point, incoming quantity, pending demand, " +
      "average daily demand, and related open purchase/sales orders.",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {
        sku: {
          type: SchemaType.STRING,
          description: "The item SKU to look up.",
        },
      },

      required: ["sku"],
    },
  },

  {
    name: "run_scenario_simulation",

    description:
      "Runs a hypothetical what-if scenario against the current ERP digital twin. " +
      "The scenario is compared against a baseline simulation with no changes. " +
      "Use this for supplier delays, demand spikes, stock adjustments, or lead-time changes.",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {
        scenario_type: {
          type: SchemaType.STRING,

          enum: [
            "supplier_delay",
            "demand_spike",
            "stock_adjustment",
            "lead_time_change",
          ],

          description: "The type of hypothetical scenario.",
        },

        vendor_id: {
          type: SchemaType.STRING,
          description:
            "Supplier/vendor ID. Required when the scenario concerns a supplier.",
        },

        sku: {
          type: SchemaType.STRING,
          description:
            "Item SKU. Required when the scenario concerns a specific item.",
        },

        delay_days: {
          type: SchemaType.NUMBER,
          description:
            "Number of days a supplier delivery is delayed.",
        },

        demand_multiplier: {
          type: SchemaType.NUMBER,
          description:
            "Multiplier applied to demand. For example, 1.5 means demand increases by 50%.",
        },

        stock_delta: {
          type: SchemaType.NUMBER,
          description:
            "Change in stock quantity. Positive increases stock, negative decreases stock.",
        },

        horizon_days: {
          type: SchemaType.NUMBER,
          description:
            "Number of days forward to simulate. Defaults to 30.",
        },
      },

      required: ["scenario_type"],
    },
  },
];

// ============================================================
// 3. Tool dispatcher
// ============================================================

async function executeTool(enterpriseId, name, args) {
  switch (name) {
    // --------------------------------------------------------
    // Current ERP / Digital Twin summary
    // --------------------------------------------------------

    case "get_twin_summary":
      return await getTwinSummary(enterpriseId);

    // --------------------------------------------------------
    // Specific item information
    // --------------------------------------------------------

    case "get_item_detail":
      return await getItemDetail(enterpriseId, args.sku);

    // --------------------------------------------------------
    // What-if simulation
    // --------------------------------------------------------

    case "run_scenario_simulation": {
      // Get the REAL current ERP state from Layer 1
      const baseState = await getTwinState(enterpriseId);

      const horizon = args.horizon_days ?? 30;

      // Build the hypothetical scenario
      const scenario = {
        scenario_type: args.scenario_type,

        vendor_id: args.vendor_id ?? null,

        sku: args.sku ?? null,

        delay_days: args.delay_days ?? null,

        demand_multiplier: args.demand_multiplier ?? null,

        stock_delta: args.stock_delta ?? null,
      };

      // Apply the hypothetical change to the ERP twin
      const scenarioState = applyScenario(baseState, scenario);

      // Simulate the normal situation
      const baselineResult = simulateForward(
        baseState,
        horizon
      );

      // Simulate the hypothetical situation
      const scenarioResult = simulateForward(
        scenarioState,
        horizon
      );

      // Compare the two simulations
      const impact = computeImpact(
        baselineResult,
        scenarioResult
      );

      return {
        scenario,

        horizon_days: horizon,

        baseline: baselineResult,

        scenario_result: scenarioResult,

        impact,
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ============================================================
// 4. Gemini AI Agent
// ============================================================

export async function runSimulationAgent(
  enterpriseId,
  userQuestion
) {
  if (!enterpriseId) {
    throw new Error(
      "enterpriseId is required to run the ERP simulation agent."
    );
  }

  if (!userQuestion || !userQuestion.trim()) {
    throw new Error(
      "userQuestion is required."
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",

    tools: [
      {
        functionDeclarations: toolDeclarations,
      },
    ],

    systemInstruction: `
You are an ERP simulation agent.

You answer questions about a company's inventory and supply-chain
operations using the company's ERP digital twin.

IMPORTANT RULES:

1. Never invent ERP numbers.

2. When the user asks about current ERP data, use the appropriate
   tool to retrieve the real data.

3. When the user asks a "what-if" question, use
   run_scenario_simulation.

4. The simulation tools use deterministic calculations.
   Do not perform the simulation yourself.

5. Clearly distinguish:
   - Current ERP facts
   - Hypothetical scenario assumptions
   - Simulation results

6. After receiving tool results, explain the result in plain,
   concise language suitable for a manager.

7. If the user's question does not contain enough information
   to construct a scenario, ask for the missing information.

8. Do not invent SKU numbers, supplier IDs, quantities,
   dates, or simulation results.

9. When discussing an item, use its SKU and name when available.

10. When discussing a scenario, explain both:
    - what changes compared with the baseline
    - why the change matters operationally

The current enterprise ID is:

${enterpriseId}
`,
  });

  const chat = model.startChat();

  let result = await chat.sendMessage(userQuestion);

  // ==========================================================
  // 5. Agent loop
  //
  // Gemini can request one or more tools.
  // We execute the requested deterministic function and
  // send the result back to Gemini.
  // ==========================================================

  while (true) {
    const functionCalls =
      result.response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      break;
    }

    const functionResponses = [];

    for (const call of functionCalls) {
      const toolResult = await executeTool(
        enterpriseId,
        call.name,
        call.args ?? {}
      );

      functionResponses.push({
        functionResponse: {
          name: call.name,
          response: toolResult,
        },
      });
    }

    result = await chat.sendMessage(
      functionResponses
    );
  }

  return result.response.text();
}

// ============================================================
// Default export
// ============================================================

export default {
  runSimulationAgent,
};