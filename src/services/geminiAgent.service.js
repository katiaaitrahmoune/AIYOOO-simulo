// src/services/geminiAgent.service.js

import {
  GoogleGenerativeAI,
  SchemaType,
} from "@google/generative-ai";

import dotenv from "dotenv";

dotenv.config();

import {
  buildSnapshot,
} from "./snapshotService.js";

import {
  applyScenario,
} from "./scenario.service.js";

import {
  simulateForward,
} from "./simulationEngine.service.js";

import {
  computeImpact,
} from "./impact.service.js";

// ============================================================
// GEMINI
// ============================================================

const genAI =
  new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

// ============================================================
// TWIN SUMMARY
// ============================================================

function createTwinSummary(twinState) {
  const items =
    twinState.items ?? [];

  const atRiskItems =
    items.filter((item) => {
      if (item.reorder_point === null) {
        return false;
      }

      return (
        item.quantity_on_hand <=
        item.reorder_point
      );
    });

  return {
    snapshot_timestamp:
      twinState.snapshot_timestamp,

    total_items:
      items.length,

    items_at_or_below_reorder_point:
      atRiskItems.length,

    at_risk_items:
      atRiskItems.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity_on_hand:
          item.quantity_on_hand,
        reorder_point:
          item.reorder_point,
        incoming_qty:
          item.incoming_qty,
        pending_demand:
          item.pending_demand,
        avg_daily_demand:
          item.avg_daily_demand,
      })),

    open_purchase_orders:
      (
        twinState.open_purchase_orders ?? []
      ).length,

    open_sales_orders:
      (
        twinState.open_sales_orders ?? []
      ).length,

    suppliers:
      (
        twinState.suppliers ?? []
      ).length,
  };
}

// ============================================================
// TOOL: GET ITEM STATE
// ============================================================

function getItemState(
  twinState,
  sku
) {
  if (!sku) {
    return {
      found: false,
      error: "SKU is required.",
    };
  }

  const item =
    (twinState.items ?? []).find(
      (item) =>
        String(item.sku).toLowerCase() ===
        String(sku).toLowerCase()
    );

  if (!item) {
    return {
      found: false,
      sku,
      message:
        `No item with SKU "${sku}" was found.`,
    };
  }

  const purchaseOrders =
    (
      twinState.open_purchase_orders ?? []
    ).filter(
      (po) =>
        String(po.item_sku).toLowerCase() ===
        String(sku).toLowerCase()
    );

  const salesOrders =
    (
      twinState.open_sales_orders ?? []
    ).filter(
      (so) =>
        String(so.item_sku).toLowerCase() ===
        String(sku).toLowerCase()
    );

  return {
    found: true,

    item,

    open_purchase_orders:
      purchaseOrders,

    open_sales_orders:
      salesOrders,
  };
}

// ============================================================
// TOOL: GET SUPPLIER STATE
// ============================================================

function getSupplierState(
  twinState,
  vendorId
) {
  if (!vendorId) {
    return {
      found: false,
      error:
        "vendor_id is required.",
    };
  }

  const supplier =
    (
      twinState.suppliers ?? []
    ).find(
      (supplier) =>
        String(
          supplier.vendor_id
        ).toLowerCase() ===
        String(
          vendorId
        ).toLowerCase()
    );

  if (!supplier) {
    return {
      found: false,
      vendor_id: vendorId,
      message:
        `No supplier with vendor ID "${vendorId}" was found.`,
    };
  }

  const purchaseOrders =
    (
      twinState.open_purchase_orders ?? []
    ).filter(
      (po) =>
        String(
          po.vendor_id
        ).toLowerCase() ===
        String(
          vendorId
        ).toLowerCase()
    );

  return {
    found: true,

    supplier,

    open_purchase_orders:
      purchaseOrders,
  };
}

// ============================================================
// GEMINI TOOL DEFINITIONS
// ============================================================

const toolDeclarations = [

  // ----------------------------------------------------------
  // TWIN SUMMARY
  // ----------------------------------------------------------

  {
    name: "get_twin_summary",

    description:
      "Returns a compact summary of the current ERP digital twin, " +
      "including item count, low-stock items, open purchase orders, " +
      "open sales orders, and supplier count.",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {},
    },
  },

  // ----------------------------------------------------------
  // ITEM STATE
  // ----------------------------------------------------------

  {
    name: "get_item_state",

    description:
      "Returns the current ERP state of a specific item by SKU, " +
      "including stock, reorder point, incoming quantity, pending " +
      "demand, average daily demand, and related orders.",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {
        sku: {
          type: SchemaType.STRING,

          description:
            "SKU of the item.",
        },
      },

      required: ["sku"],
    },
  },

  // ----------------------------------------------------------
  // SUPPLIER STATE
  // ----------------------------------------------------------

  {
    name: "get_supplier_state",

    description:
      "Returns supplier information including average lead time, " +
      "reliability score, and open purchase orders.",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {
        vendor_id: {
          type: SchemaType.STRING,

          description:
            "Supplier/vendor ID.",
        },
      },

      required: ["vendor_id"],
    },
  },

  // ----------------------------------------------------------
  // SIMULATION
  // ----------------------------------------------------------

  {
    name: "run_scenario_simulation",

    description:
      "Runs a deterministic what-if simulation. It applies a " +
      "hypothetical scenario to the current ERP digital twin, " +
      "simulates both the normal baseline and the hypothetical " +
      "scenario, and compares their impact.",

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
        },

        vendor_id: {
          type: SchemaType.STRING,
        },

        sku: {
          type: SchemaType.STRING,
        },

        delay_days: {
          type: SchemaType.NUMBER,
        },

        demand_multiplier: {
          type: SchemaType.NUMBER,
        },

        stock_delta: {
          type: SchemaType.NUMBER,
        },

        horizon_days: {
          type: SchemaType.NUMBER,

          description:
            "Simulation horizon in days. Defaults to 30.",
        },
      },

      required: [
        "scenario_type",
      ],
    },
  },
];

// ============================================================
// TOOL EXECUTOR
// ============================================================

async function executeTool(
  toolName,
  args,
  twinState
) {

  switch (toolName) {

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    case "get_twin_summary":

      return createTwinSummary(
        twinState
      );

    // --------------------------------------------------------
    // ITEM
    // --------------------------------------------------------

    case "get_item_state":

      return getItemState(
        twinState,
        args.sku
      );

    // --------------------------------------------------------
    // SUPPLIER
    // --------------------------------------------------------

    case "get_supplier_state":

      return getSupplierState(
        twinState,
        args.vendor_id
      );

    // --------------------------------------------------------
    // SIMULATION
    // --------------------------------------------------------

    case "run_scenario_simulation": {

      const horizon =
        args.horizon_days ?? 30;

      const scenario = {
        scenario_type:
          args.scenario_type,

        vendor_id:
          args.vendor_id ?? null,

        sku:
          args.sku ?? null,

        delay_days:
          args.delay_days ?? null,

        demand_multiplier:
          args.demand_multiplier ?? null,

        stock_delta:
          args.stock_delta ?? null,
      };

      // Apply hypothetical scenario
      const scenarioState =
        applyScenario(
          twinState,
          scenario
        );

      // Normal world
      const baselineResult =
        simulateForward(
          twinState,
          horizon
        );

      // Hypothetical world
      const scenarioResult =
        simulateForward(
          scenarioState,
          horizon
        );

      // Difference
      const impact =
        computeImpact(
          baselineResult,
          scenarioResult
        );

      return {
        scenario,

        horizon_days:
          horizon,

        baseline:
          baselineResult,

        scenario_result:
          scenarioResult,

        impact,
      };
    }

    default:

      throw new Error(
        `Unknown tool: ${toolName}`
      );
  }
}

// ============================================================
// MAIN AI SIMULATION AGENT
// ============================================================

export async function runSimulationAgent(
  userQuestion
) {

  // ----------------------------------------------------------
  // Validate
  // ----------------------------------------------------------

  if (
    !userQuestion ||
    typeof userQuestion !== "string" ||
    !userQuestion.trim()
  ) {
    throw new Error(
      "A user question is required."
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured."
    );
  }

  // ----------------------------------------------------------
  // STEP 1
  // ERP → DIGITAL TWIN
  // ----------------------------------------------------------

  const twinState =
    await buildSnapshot();

  // ----------------------------------------------------------
  // STEP 2
  // Compact information for Gemini
  // ----------------------------------------------------------

  const twinSummary =
    createTwinSummary(
      twinState
    );

  // ----------------------------------------------------------
  // STEP 3
  // Gemini
  // ----------------------------------------------------------

  const model =
    genAI.getGenerativeModel({

      model:
        "gemini-2.5-flash",

      tools: [
        {
          functionDeclarations:
            toolDeclarations,
        },
      ],

      systemInstruction: `
You are an AI Simulation Agent for an ERP digital twin.

You answer operational questions and "what-if" questions
using the company's current ERP data.

The ERP data has already been loaded into a digital twin.

RULES:

1. Never invent ERP numbers.

2. Use the provided summary for general information.

3. Use get_item_state when detailed item information
   is required.

4. Use get_supplier_state when detailed supplier
   information is required.

5. Use run_scenario_simulation for hypothetical
   what-if questions.

6. Never perform the simulation calculations yourself.
   The deterministic backend tools perform them.

7. You may call multiple tools.

8. You may use the result of one tool to decide
   which tool to call next.

9. Clearly distinguish:
   - current ERP facts
   - hypothetical assumptions
   - simulation results

10. The final answer should be understandable to
    a business manager.

11. Explain:
    - what happens
    - why it happens
    - what changes compared with the baseline
    - which items/orders/suppliers are affected

12. Never invent SKUs, supplier IDs, quantities,
    dates, or simulation results.

13. If required information is missing, ask for it.

The current ERP twin summary is supplied in the
user message.
`,
    });

  // ----------------------------------------------------------
  // STEP 4
  // Start conversation
  // ----------------------------------------------------------

  const chat =
    model.startChat();

  // ----------------------------------------------------------
  // STEP 5
  // Send question + summary
  // ----------------------------------------------------------

  const initialPrompt = `
CURRENT ERP DIGITAL TWIN SUMMARY:

${JSON.stringify(
  twinSummary,
  null,
  2
)}

USER QUESTION:

${userQuestion}

Use the available tools when more detailed ERP
information or simulation is required.
`;

  let result =
    await chat.sendMessage(
      initialPrompt
    );

  // ----------------------------------------------------------
  // STEP 6
  // TOOL LOOP
  // ----------------------------------------------------------

  while (true) {

    const functionCalls =
      result.response.functionCalls();

    if (
      !functionCalls ||
      functionCalls.length === 0
    ) {
      break;
    }

    const functionResponses = [];

    for (
      const call of functionCalls
    ) {

      console.log(
        `Gemini requested tool: ${call.name}`,
        call.args
      );

      const toolResult =
        await executeTool(
          call.name,
          call.args ?? {},
          twinState
        );

      functionResponses.push({
        functionResponse: {
          name:
            call.name,

          response:
            toolResult,
        },
      });
    }

    result =
      await chat.sendMessage(
        functionResponses
      );
  }

  // ----------------------------------------------------------
  // STEP 7
  // FINAL ANSWER
  // ----------------------------------------------------------

  return result.response.text();
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  runSimulationAgent,
};