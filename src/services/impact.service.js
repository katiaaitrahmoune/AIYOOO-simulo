// src/services/impact.service.js
// Tool 5: compute_impact — diffs two SimulationResults (baseline vs. scenario)

export function computeImpact(before, after) {
  const beforeStockoutBySku = new Map(before.stockout_events.map((e) => [e.sku, e.stockout_day]));
  const afterStockoutBySku = new Map(after.stockout_events.map((e) => [e.sku, e.stockout_day]));

  const newlyStockedOut = [];
  const stockoutShifted = [];

  for (const [sku, afterDay] of afterStockoutBySku) {
    const beforeDay = beforeStockoutBySku.has(sku) ? beforeStockoutBySku.get(sku) : null;
    if (beforeDay === null) {
      newlyStockedOut.push(sku);
    } else if (beforeDay !== afterDay) {
      stockoutShifted.push({
        sku,
        before_day: beforeDay,
        after_day: afterDay,
        delta_days: afterDay - beforeDay,
      });
    }
  }

  const beforeMissedIds = new Set(
    before.missed_fulfillments.filter((m) => m.projected_fulfillment_day === null).map((m) => m.so_id)
  );
  const newlyMissedFulfillments = after.missed_fulfillments
    .filter((m) => m.projected_fulfillment_day === null && !beforeMissedIds.has(m.so_id))
    .map((m) => m.so_id);

  return {
    newly_stocked_out: newlyStockedOut,
    stockout_shifted: stockoutShifted,
    newly_missed_fulfillments: newlyMissedFulfillments,
  };
}