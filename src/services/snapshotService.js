// src/services/snapshotService.js

import snapshotModel from "../models/snapshotModel.js";

function mapItem(r) {
  return {
    item_id: r.item_id,
    sku: r.sku,
    name: r.name,
    quantity_on_hand: Number(r.quantity_on_hand),
    reorder_point:
      r.reorder_point !== null ? Number(r.reorder_point) : null,
    incoming_qty: Number(r.incoming_qty),
    pending_demand: Number(r.pending_demand),
    avg_daily_demand: Number(r.avg_daily_demand),
  };
}

function mapPurchaseOrder(r) {
  return {
    po_id: r.po_id,
    item_sku: r.item_sku,
    vendor_id: r.vendor_id,
    qty_ordered: Number(r.qty_ordered),
    qty_received: Number(r.qty_received),
    expected_date: r.expected_date,
  };
}

function mapSalesOrder(r) {
  return {
    so_id: r.so_id,
    item_sku: r.item_sku,
    qty_ordered: Number(r.qty_ordered),
    qty_fulfilled: Number(r.qty_fulfilled),
    promised_date: r.promised_date,
  };
}

function mapSupplier(r) {
  return {
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
  };
}

/*
 * The hackathon uses one shared mock ERP dataset.
 * We therefore automatically select the most recently
 * created enterprise instead of requiring enterpriseId
 * from the user/API request.
 */
async function getEnterpriseId() {
  const enterpriseId = await snapshotModel.findMostRecentEnterpriseId();

  if (!enterpriseId) {
    throw new Error("No enterprise data found in the ERP database");
  }

  return enterpriseId;
}

async function getItemsSnapshot() {
  const enterpriseId = await getEnterpriseId();

  const rows =
    await snapshotModel.findItemsByEnterprise(enterpriseId);

  return rows.map(mapItem);
}

async function getOpenPurchaseOrders() {
  const enterpriseId = await getEnterpriseId();

  const rows =
    await snapshotModel.findOpenPurchaseOrdersByEnterprise(enterpriseId);

  return rows.map(mapPurchaseOrder);
}

async function getOpenSalesOrders() {
  const enterpriseId = await getEnterpriseId();

  const rows =
    await snapshotModel.findOpenSalesOrdersByEnterprise(enterpriseId);

  return rows.map(mapSalesOrder);
}

async function getSuppliers() {
  const enterpriseId = await getEnterpriseId();

  const rows =
    await snapshotModel.findSuppliersByEnterprise(enterpriseId);

  return rows.map(mapSupplier);
}

async function buildSnapshot() {
  const enterpriseId = await getEnterpriseId();

  const [
    items,
    openPurchaseOrders,
    openSalesOrders,
    suppliers,
  ] = await Promise.all([
    snapshotModel.findItemsByEnterprise(enterpriseId),
    snapshotModel.findOpenPurchaseOrdersByEnterprise(enterpriseId),
    snapshotModel.findOpenSalesOrdersByEnterprise(enterpriseId),
    snapshotModel.findSuppliersByEnterprise(enterpriseId),
  ]);

  return {
    snapshot_timestamp: new Date().toISOString(),

    items: items.map(mapItem),

    open_purchase_orders:
      openPurchaseOrders.map(mapPurchaseOrder),

    open_sales_orders:
      openSalesOrders.map(mapSalesOrder),

    suppliers: suppliers.map(mapSupplier),
  };
}

export {
  buildSnapshot,
  getItemsSnapshot,
  getOpenPurchaseOrders,
  getOpenSalesOrders,
  getSuppliers,
};

export default {
  buildSnapshot,
  getItemsSnapshot,
  getOpenPurchaseOrders,
  getOpenSalesOrders,
  getSuppliers,
};