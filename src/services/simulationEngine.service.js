// src/services/simulationEngine.service.js
// Tool 4: simulate_forward — deterministic day-by-day rollout. No LLM involved.

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function simulateForward(state, horizonDays) {
  const dailyProjection = [];
  const stockoutEvents = [];
  const stockoutDayBySku = new Map();

  // running stock per sku, seeded from current state
  const runningStock = new Map();
  state.items.forEach((i) => runningStock.set(i.sku, i.quantity_on_hand));

  const today = state.snapshot_timestamp.slice(0, 10);

  for (let day = 0; day < horizonDays; day++) {
    const date = addDays(today, day);

    for (const item of state.items) {
      let stock = runningStock.get(item.sku);

      // receive any PO arriving today
      const arrivingPOs = state.open_purchase_orders.filter(
        (po) => po.item_sku === item.sku && po.expected_date === date
      );
      for (const po of arrivingPOs) {
        stock += po.qty_ordered - po.qty_received;
      }

      // consume average daily demand
      stock -= item.avg_daily_demand;
      if (stock < 0) stock = 0;

      runningStock.set(item.sku, stock);

      const stockout = stock <= 0;
      if (stockout && !stockoutDayBySku.has(item.sku)) {
        stockoutDayBySku.set(item.sku, day);
        stockoutEvents.push({ sku: item.sku, stockout_day: day, stockout_date: date });
      }

      dailyProjection.push({
        day,
        date,
        sku: item.sku,
        projected_stock: Math.round(stock * 100) / 100,
        stockout,
      });
    }
  }

  // check sales order fulfillment against projected stock availability
  const missedFulfillments = state.open_sales_orders.map((so) => {
    const promisedDayOffset = Math.floor(
      (new Date(so.promised_date).getTime() - new Date(today).getTime()) / 86400000
    );
    const stockoutDay = stockoutDayBySku.get(so.item_sku);
    const fulfilled =
      stockoutDay === undefined || promisedDayOffset < stockoutDay
        ? promisedDayOffset
        : null;

    return {
      so_id: so.so_id,
      sku: so.item_sku,
      promised_date: so.promised_date,
      projected_fulfillment_day: fulfilled,
    };
  });

  return {
    horizon_days: horizonDays,
    daily_projection: dailyProjection,
    stockout_events: stockoutEvents,
    missed_fulfillments: missedFulfillments,
  };
}

module.exports = { simulateForward };