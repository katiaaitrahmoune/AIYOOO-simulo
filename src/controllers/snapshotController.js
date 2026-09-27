// src/controllers/snapshotController.js
import snapshotService from '../services/snapshotService.js';
import snapshotModel from '../models/snapshotModel.js';
import pool from '../config/db.js';

// GET /api/enterprises/:enterpriseId/snapshot
const getSnapshot = async (req, res) => {
  const { enterpriseId } = req.params;
  const snapshot = await snapshotService.buildSnapshot(enterpriseId);

  res.status(200).json(snapshot);
};

// GET /api/enterprises/:enterpriseId/snapshot/items
const getItemsOnly = async (req, res) => {
  const { enterpriseId } = req.params;
  const items = await snapshotService.getItemsSnapshot(enterpriseId);

  res.status(200).json({ items });
};

// GET /api/enterprises/:enterpriseId/snapshot/purchase-orders
const getPurchaseOrdersOnly = async (req, res) => {
  const { enterpriseId } = req.params;
  const openPurchaseOrders =
    await snapshotService.getOpenPurchaseOrders(enterpriseId);

  res.status(200).json({
    open_purchase_orders: openPurchaseOrders,
  });
};

// GET /api/enterprises/:enterpriseId/snapshot/sales-orders
const getSalesOrdersOnly = async (req, res) => {
  const { enterpriseId } = req.params;
  const openSalesOrders =
    await snapshotService.getOpenSalesOrders(enterpriseId);

  res.status(200).json({
    open_sales_orders: openSalesOrders,
  });
};

// GET /api/enterprises/:enterpriseId/snapshot/suppliers
const getSuppliersOnly = async (req, res) => {
  const { enterpriseId } = req.params;
  const suppliers = await snapshotService.getSuppliers(enterpriseId);

  res.status(200).json({ suppliers });
};

// GET /api/enterprises/snapshot/latest
// GET /api/enterprises/snapshot/latest
const getLatestSnapshot = async (req, res) => {
  try {
    const [
      itemsResult,
      purchaseOrdersResult,
      salesOrdersResult,
      suppliersResult,
    ] = await Promise.all([
      pool.query(`
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
          SELECT
            pol.item_id,
            SUM(pol.quantity_ordered - pol.quantity_received) AS incoming_qty
          FROM purchase_order_lines pol
          JOIN purchase_orders po ON po.po_id = pol.po_id
          WHERE po.status IN ('SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED')
          GROUP BY pol.item_id
        ) incoming ON incoming.item_id = i.item_id
        LEFT JOIN (
          SELECT
            sol.item_id,
            SUM(sol.quantity_ordered - sol.quantity_fulfilled) AS pending_demand
          FROM sales_order_lines sol
          JOIN sales_orders so ON so.so_id = sol.so_id
          WHERE so.status IN ('CONFIRMED', 'PARTIALLY_FULFILLED')
          GROUP BY sol.item_id
        ) demand ON demand.item_id = i.item_id
        LEFT JOIN (
          SELECT
            item_id,
            SUM(quantity) / 30.0 AS avg_daily_demand
          FROM stock_movements
          WHERE movement_type = 'ISSUE'
            AND moved_at >= now() - INTERVAL '30 days'
          GROUP BY item_id
        ) avg_demand ON avg_demand.item_id = i.item_id
        WHERE i.is_active = TRUE
        GROUP BY
          i.item_id,
          i.sku,
          i.item_name,
          rp.reorder_level,
          incoming.incoming_qty,
          demand.pending_demand,
          avg_demand.avg_daily_demand
        ORDER BY i.sku;
      `),

      pool.query(`
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
        WHERE po.status IN ('SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED')
        ORDER BY po.expected_delivery_date NULLS LAST;
      `),

      pool.query(`
        SELECT
          so.so_number AS so_id,
          i.sku AS item_sku,
          sol.quantity_ordered AS qty_ordered,
          sol.quantity_fulfilled AS qty_fulfilled,
          so.requested_delivery_date AS promised_date
        FROM sales_orders so
        JOIN sales_order_lines sol ON sol.so_id = so.so_id
        JOIN inventory_items i ON i.item_id = sol.item_id
        WHERE so.status IN ('CONFIRMED', 'PARTIALLY_FULFILLED')
        ORDER BY so.requested_delivery_date NULLS LAST;
      `),

      pool.query(`
        SELECT
          v.vendor_id,
          v.vendor_name AS name,
          AVG(gr.received_date - po.order_date) AS avg_lead_time_days,
          AVG(vr.overall_score) / 10.0 AS reliability_score
        FROM vendors v
        LEFT JOIN purchase_orders po ON po.vendor_id = v.vendor_id
        LEFT JOIN goods_receipts gr ON gr.po_id = po.po_id
        LEFT JOIN vendor_ratings vr ON vr.vendor_id = v.vendor_id
        WHERE v.is_active = TRUE
        GROUP BY v.vendor_id, v.vendor_name
        ORDER BY v.vendor_name;
      `),
    ]);

    const items = itemsResult.rows.map((r) => ({
      item_id: r.item_id,
      sku: r.sku,
      name: r.name,
      quantity_on_hand: Number(r.quantity_on_hand),
      reorder_point:
        r.reorder_point !== null ? Number(r.reorder_point) : null,
      incoming_qty: Number(r.incoming_qty),
      pending_demand: Number(r.pending_demand),
      avg_daily_demand: Number(r.avg_daily_demand),
    }));

    const openPurchaseOrders = purchaseOrdersResult.rows.map((r) => ({
      po_id: r.po_id,
      item_sku: r.item_sku,
      vendor_id: r.vendor_id,
      qty_ordered: Number(r.qty_ordered),
      qty_received: Number(r.qty_received),
      expected_date: r.expected_date,
    }));

    const openSalesOrders = salesOrdersResult.rows.map((r) => ({
      so_id: r.so_id,
      item_sku: r.item_sku,
      qty_ordered: Number(r.qty_ordered),
      qty_fulfilled: Number(r.qty_fulfilled),
      promised_date: r.promised_date,
    }));

    const suppliers = suppliersResult.rows.map((r) => ({
      vendor_id: r.vendor_id,
      name: r.name,
      avg_lead_time_days:
        r.avg_lead_time_days !== null
          ? Math.round(Number(r.avg_lead_time_days))
          : null,
      reliability_score:
        r.reliability_score !== null
          ? Number(Number(r.reliability_score).toFixed(2))
          : null,
    }));

    res.status(200).json({
      snapshot_timestamp: new Date().toISOString(),
      items,
      open_purchase_orders: openPurchaseOrders,
      open_sales_orders: openSalesOrders,
      suppliers,
    });
  } catch (error) {
    console.error('Error building latest snapshot:', error);

    res.status(500).json({
      error: 'Failed to build latest snapshot',
    });
  }
};


export {
  getSnapshot,
  getItemsOnly,
  getPurchaseOrdersOnly,
  getSalesOrdersOnly,
  getSuppliersOnly,
  getLatestSnapshot,
};

export default {
  getSnapshot,
  getItemsOnly,
  getPurchaseOrdersOnly,
  getSalesOrdersOnly,
  getSuppliersOnly,
  getLatestSnapshot,
};
