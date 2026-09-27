// src/models/snapshotModel.js
import pool from '../config/db.js';

async function findItemsByEnterprise(enterpriseId) {
  const query = `
    SELECT
      i.item_id,
      i.sku,
      i.item_name AS name,
      COALESCE(SUM(sl.quantity_on_hand), 0)::numeric AS quantity_on_hand,
      rp.reorder_level AS reorder_point,
      COALESCE(incoming.incoming_qty, 0)::numeric AS incoming_qty,
      COALESCE(demand.pending_demand, 0)::numeric AS pending_demand,
      COALESCE(avg_demand.avg_daily_demand, 0)::numeric AS avg_daily_demand
    FROM inventory_items i
    LEFT JOIN stock_levels sl ON sl.item_id = i.item_id
    LEFT JOIN reorder_points rp ON rp.item_id = i.item_id
    LEFT JOIN (
      SELECT pol.item_id, SUM(pol.quantity_ordered - pol.quantity_received) AS incoming_qty
      FROM purchase_order_lines pol
      JOIN purchase_orders po ON po.po_id = pol.po_id
      WHERE po.status IN ('SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED')
      GROUP BY pol.item_id
    ) incoming ON incoming.item_id = i.item_id
    LEFT JOIN (
      SELECT sol.item_id, SUM(sol.quantity_ordered - sol.quantity_fulfilled) AS pending_demand
      FROM sales_order_lines sol
      JOIN sales_orders so ON so.so_id = sol.so_id
      WHERE so.status IN ('CONFIRMED', 'PARTIALLY_FULFILLED')
      GROUP BY sol.item_id
    ) demand ON demand.item_id = i.item_id
    LEFT JOIN (
      SELECT item_id, SUM(quantity) / 30.0 AS avg_daily_demand
      FROM stock_movements
      WHERE movement_type = 'ISSUE'
        AND moved_at >= now() - INTERVAL '30 days'
      GROUP BY item_id
    ) avg_demand ON avg_demand.item_id = i.item_id
    WHERE i.enterprise_id = $1 AND i.is_active = TRUE
    GROUP BY i.item_id, i.sku, i.item_name, rp.reorder_level,
             incoming.incoming_qty, demand.pending_demand, avg_demand.avg_daily_demand
    ORDER BY i.sku;
  `;

  const { rows } = await pool.query(query, [enterpriseId]);
  return rows;
}

async function findOpenPurchaseOrdersByEnterprise(enterpriseId) {
  const query = `
    SELECT
      po.po_number AS po_id,
      i.sku AS item_sku,
      po.vendor_id,
      pol.quantity_ordered AS qty_ordered,
      pol.quantity_received AS qty_received,
      po.expected_delivery_date AS expected_date
    FROM purchase_orders po
    JOIN purchase_order_lines pol ON pol.po_id = po.po_id
    JOIN inventory_items i ON i.item_id = pol.item_id
    WHERE po.enterprise_id = $1
      AND po.status IN ('SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED')
    ORDER BY po.expected_delivery_date NULLS LAST;
  `;

  const { rows } = await pool.query(query, [enterpriseId]);
  return rows;
}

async function findOpenSalesOrdersByEnterprise(enterpriseId) {
  const query = `
    SELECT
      so.so_number AS so_id,
      i.sku AS item_sku,
      sol.quantity_ordered AS qty_ordered,
      sol.quantity_fulfilled AS qty_fulfilled,
      so.requested_delivery_date AS promised_date
    FROM sales_orders so
    JOIN sales_order_lines sol ON sol.so_id = so.so_id
    JOIN inventory_items i ON i.item_id = sol.item_id
    WHERE so.enterprise_id = $1
      AND so.status IN ('CONFIRMED', 'PARTIALLY_FULFILLED')
    ORDER BY so.requested_delivery_date NULLS LAST;
  `;

  const { rows } = await pool.query(query, [enterpriseId]);
  return rows;
}

async function findSuppliersByEnterprise(enterpriseId) {
  const query = `
    SELECT
      v.vendor_id,
      v.vendor_name AS name,
      AVG(gr.received_date - po.order_date) AS avg_lead_time_days,
      AVG(vr.overall_score) / 10.0 AS reliability_score
    FROM vendors v
    LEFT JOIN purchase_orders po ON po.vendor_id = v.vendor_id
    LEFT JOIN goods_receipts gr ON gr.po_id = po.po_id
    LEFT JOIN vendor_ratings vr ON vr.vendor_id = v.vendor_id
    WHERE v.enterprise_id = $1 AND v.is_active = TRUE
    GROUP BY v.vendor_id, v.vendor_name
    ORDER BY v.vendor_name;
  `;

  const { rows } = await pool.query(query, [enterpriseId]);
  return rows;
}

/** Simple existence check, used by the validator */
async function enterpriseExists(enterpriseId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM enterprises WHERE enterprise_id = $1',
    [enterpriseId]
  );

  return rows.length > 0;
}

async function findMostRecentEnterpriseId() {
  const query = `
    SELECT enterprise_id
    FROM enterprises
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  const { rows } = await pool.query(query);

  return rows.length > 0 ? rows[0].enterprise_id : null;
}

// Named exports
// Named exports
export {
  findItemsByEnterprise,
  findOpenPurchaseOrdersByEnterprise,
  findOpenSalesOrdersByEnterprise,
  findSuppliersByEnterprise,
  enterpriseExists,
  findMostRecentEnterpriseId,
};

// Default export
export default {
  findItemsByEnterprise,
  findOpenPurchaseOrdersByEnterprise,
  findOpenSalesOrdersByEnterprise,
  findSuppliersByEnterprise,
  enterpriseExists,
  findMostRecentEnterpriseId,
};
