// src/types/twin.types.ts

export interface ItemState {
  item_id: string;
  sku: string;
  name: string;
  quantity_on_hand: number;
  reorder_point: number;
  incoming_qty: number;
  pending_demand: number;
  avg_daily_demand: number;
}

export interface OpenPurchaseOrder {
  po_id: string;
  item_sku: string;
  vendor_id: string;
  qty_ordered: number;
  qty_received: number;
  expected_date: string; // ISO date
}

export interface OpenSalesOrder {
  so_id: string;
  item_sku: string;
  qty_ordered: number;
  qty_fulfilled: number;
  promised_date: string; // ISO date
}

export interface SupplierState {
  vendor_id: string;
  name: string;
  avg_lead_time_days: number;
  reliability_score: number;
}

export interface TwinState {
  snapshot_timestamp: string;
  items: ItemState[];
  open_purchase_orders: OpenPurchaseOrder[];
  open_sales_orders: OpenSalesOrder[];
  suppliers: SupplierState[];
}

// ---- Scenario ----

export type ScenarioType =
  | "supplier_delay"
  | "demand_spike"
  | "stock_adjustment"
  | "lead_time_change";

export interface ScenarioParams {
  scenario_type: ScenarioType;
  vendor_id?: string;
  sku?: string;
  delay_days?: number;
  demand_multiplier?: number;
  stock_delta?: number;
}

// ---- Simulation output ----

export interface DailyItemProjection {
  day: number; // offset from today, 0-indexed
  date: string;
  sku: string;
  projected_stock: number;
  stockout: boolean;
}

export interface SimulationResult {
  horizon_days: number;
  daily_projection: DailyItemProjection[];
  stockout_events: {
    sku: string;
    stockout_day: number;
    stockout_date: string;
  }[];
  missed_fulfillments: {
    so_id: string;
    sku: string;
    promised_date: string;
    projected_fulfillment_day: number | null; // null = not fulfilled within horizon
  }[];
}

// ---- Impact diff ----

export interface ImpactReport {
  newly_stocked_out: string[]; // skus that stock out in "after" but not "before"
  stockout_shifted: {
    sku: string;
    before_day: number | null;
    after_day: number | null;
    delta_days: number;
  }[];
  newly_missed_fulfillments: string[]; // so_ids
}