// src/services/scenario.service.js
// Tool 3: apply_scenario — pure, deterministic, in-memory mutation of a cloned state.
// Never writes to Neon. Always returns a NEW state object.

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function applyScenario(state, scenario) {
  const next = cloneState(state);

  switch (scenario.scenario_type) {
    case "supplier_delay": {
      if (!scenario.vendor_id || scenario.delay_days == null) {
        throw new Error("supplier_delay requires vendor_id and delay_days");
      }
      next.open_purchase_orders = next.open_purchase_orders.map((po) => {
        if (po.vendor_id !== scenario.vendor_id) return po;
        const newDate = new Date(po.expected_date);
        newDate.setDate(newDate.getDate() + scenario.delay_days);
        return { ...po, expected_date: newDate.toISOString().slice(0, 10) };
      });
      break;
    }

    case "demand_spike": {
      if (!scenario.sku || scenario.demand_multiplier == null) {
        throw new Error("demand_spike requires sku and demand_multiplier");
      }
      next.items = next.items.map((item) =>
        item.sku === scenario.sku
          ? { ...item, avg_daily_demand: item.avg_daily_demand * scenario.demand_multiplier }
          : item
      );
      break;
    }

    case "stock_adjustment": {
      if (!scenario.sku || scenario.stock_delta == null) {
        throw new Error("stock_adjustment requires sku and stock_delta");
      }
      next.items = next.items.map((item) =>
        item.sku === scenario.sku
          ? { ...item, quantity_on_hand: Math.max(0, item.quantity_on_hand + scenario.stock_delta) }
          : item
      );
      break;
    }

    case "lead_time_change": {
      if (!scenario.vendor_id || scenario.delay_days == null) {
        throw new Error("lead_time_change requires vendor_id and delay_days");
      }
      next.suppliers = next.suppliers.map((s) =>
        s.vendor_id === scenario.vendor_id
          ? { ...s, avg_lead_time_days: s.avg_lead_time_days + scenario.delay_days }
          : s
      );
      break;
    }

    default:
      throw new Error(`Unknown scenario_type: ${scenario.scenario_type}`);
  }

  return next;
}