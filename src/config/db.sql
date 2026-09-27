-- ============================================================
-- DIGITAL TWIN / ERP DATABASE SCHEMA
-- PostgreSQL 14+
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENTERPRISE / ONBOARDING
-- ============================================================

CREATE TYPE enterprise_category AS ENUM (
    'MANUFACTURING',
    'RETAIL_DISTRIBUTION',
    'LOGISTICS',
    'FINANCIAL_SERVICES'
);

CREATE TABLE enterprises (
    enterprise_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_name     VARCHAR(255) NOT NULL,
    category            enterprise_category NOT NULL,
    employee_count       INTEGER,
    monthly_revenue_approx NUMERIC(18,2),
    erp_system_in_use   VARCHAR(255),
    official_website     VARCHAR(255),
    site_count           INTEGER,                 -- number of sites/locations
    main_cost_driver     VARCHAR(255),
    optimization_goal    VARCHAR(255),             -- "what should the twin optimize for first"
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Physical sites/locations belonging to an enterprise (supports "sites / locations" being a list)
CREATE TABLE enterprise_sites (
    site_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id       UUID NOT NULL REFERENCES enterprises(enterprise_id) ON DELETE CASCADE,
    site_name           VARCHAR(255) NOT NULL,
    address             VARCHAR(500),
    city                VARCHAR(150),
    country             VARCHAR(150),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users / sign-up account (the person creating the enterprise account)
CREATE TABLE users (
    user_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id       UUID NOT NULL REFERENCES enterprises(enterprise_id) ON DELETE CASCADE,
    full_name           VARCHAR(255) NOT NULL,
    work_email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,     -- store a hash (bcrypt/argon2), never plaintext
    role                VARCHAR(100) DEFAULT 'ADMIN',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE inventory_items (
    item_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id       UUID NOT NULL REFERENCES enterprises(enterprise_id) ON DELETE CASCADE,
    sku                 VARCHAR(100) NOT NULL,
    item_name           VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(150),
    unit_of_measure     VARCHAR(50),
    barcode             VARCHAR(100),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (enterprise_id, sku)
);

CREATE TABLE stock_levels (
    stock_level_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id             UUID NOT NULL REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    site_id             UUID REFERENCES enterprise_sites(site_id) ON DELETE SET NULL,
    quantity_on_hand    NUMERIC(18,3) NOT NULL DEFAULT 0,
    quantity_reserved   NUMERIC(18,3) NOT NULL DEFAULT 0,
    quantity_available  NUMERIC(18,3) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    last_counted_at     TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_id, site_id)
);

CREATE TYPE stock_movement_type AS ENUM (
    'RECEIPT', 'ISSUE', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RETURN'
);

CREATE TABLE stock_movements (
    movement_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id             UUID NOT NULL REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    site_id             UUID REFERENCES enterprise_sites(site_id) ON DELETE SET NULL,
    movement_type       stock_movement_type NOT NULL,
    quantity            NUMERIC(18,3) NOT NULL,
    reference_type      VARCHAR(100),           -- e.g. 'GOODS_RECEIPT', 'SALES_ORDER'
    reference_id        UUID,                   -- FK to the originating document (not enforced, polymorphic)
    notes                TEXT,
    moved_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by           UUID REFERENCES users(user_id)
);

CREATE TABLE reorder_points (
    reorder_point_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id             UUID NOT NULL REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    site_id             UUID REFERENCES enterprise_sites(site_id) ON DELETE SET NULL,
    reorder_level       NUMERIC(18,3) NOT NULL,
    reorder_quantity    NUMERIC(18,3) NOT NULL,
    safety_stock        NUMERIC(18,3) DEFAULT 0,
    lead_time_days      INTEGER,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (item_id, site_id)
);

CREATE TABLE item_costs (
    item_cost_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id             UUID NOT NULL REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    standard_cost       NUMERIC(18,4),
    average_cost        NUMERIC(18,4),
    last_purchase_cost  NUMERIC(18,4),
    currency             VARCHAR(10) DEFAULT 'DZD',
    effective_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================

CREATE TABLE vendors (
    vendor_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id       UUID NOT NULL REFERENCES enterprises(enterprise_id) ON DELETE CASCADE,
    vendor_name         VARCHAR(255) NOT NULL,
    contact_name        VARCHAR(255),
    email                VARCHAR(255),
    phone                VARCHAR(50),
    address              VARCHAR(500),
    country              VARCHAR(150),
    payment_terms        VARCHAR(150),
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vendor_ratings (
    rating_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id            UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    rating_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    quality_score         NUMERIC(3,1) CHECK (quality_score BETWEEN 0 AND 10),
    delivery_score         NUMERIC(3,1) CHECK (delivery_score BETWEEN 0 AND 10),
    price_score            NUMERIC(3,1) CHECK (price_score BETWEEN 0 AND 10),
    overall_score           NUMERIC(3,1) CHECK (overall_score BETWEEN 0 AND 10),
    comments                 TEXT,
    rated_by                 UUID REFERENCES users(user_id),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROCUREMENT
-- ============================================================

CREATE TYPE po_status AS ENUM (
    'DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED'
);

CREATE TABLE purchase_orders (
    po_id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id         UUID NOT NULL REFERENCES enterprises(enterprise_id) ON DELETE CASCADE,
    vendor_id              UUID NOT NULL REFERENCES vendors(vendor_id),
    site_id                 UUID REFERENCES enterprise_sites(site_id) ON DELETE SET NULL,
    po_number                VARCHAR(100) NOT NULL,
    status                    po_status NOT NULL DEFAULT 'DRAFT',
    order_date                DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date    DATE,
    currency                   VARCHAR(10) DEFAULT 'DZD',
    total_amount                NUMERIC(18,2) DEFAULT 0,
    notes                        TEXT,
    created_by                   UUID REFERENCES users(user_id),
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (enterprise_id, po_number)
);

CREATE TABLE purchase_order_lines (
    po_line_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id                   UUID NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    item_id                  UUID NOT NULL REFERENCES inventory_items(item_id),
    line_number                INTEGER NOT NULL,
    quantity_ordered            NUMERIC(18,3) NOT NULL,
    quantity_received            NUMERIC(18,3) NOT NULL DEFAULT 0,
    unit_price                    NUMERIC(18,4) NOT NULL,
    line_total                     NUMERIC(18,2) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED,
    UNIQUE (po_id, line_number)
);

CREATE TABLE goods_receipts (
    receipt_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id                    UUID NOT NULL REFERENCES purchase_orders(po_id),
    site_id                   UUID REFERENCES enterprise_sites(site_id) ON DELETE SET NULL,
    receipt_number              VARCHAR(100) NOT NULL,
    received_date                 DATE NOT NULL DEFAULT CURRENT_DATE,
    received_by                    UUID REFERENCES users(user_id),
    notes                            TEXT,
    created_at                       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE goods_receipt_lines (
    receipt_line_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id                  UUID NOT NULL REFERENCES goods_receipts(receipt_id) ON DELETE CASCADE,
    po_line_id                    UUID NOT NULL REFERENCES purchase_order_lines(po_line_id),
    item_id                         UUID NOT NULL REFERENCES inventory_items(item_id),
    quantity_received                 NUMERIC(18,3) NOT NULL,
    condition_notes                     VARCHAR(255)
);

-- ============================================================
-- SALES
-- ============================================================

CREATE TABLE customers (
    customer_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id             UUID NOT NULL REFERENCES enterprises(enterprise_id) ON DELETE CASCADE,
    customer_name               VARCHAR(255) NOT NULL,
    contact_name                  VARCHAR(255),
    email                           VARCHAR(255),
    phone                            VARCHAR(50),
    billing_address                   VARCHAR(500),
    shipping_address                    VARCHAR(500),
    is_active                             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE so_status AS ENUM (
    'DRAFT', 'CONFIRMED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'CLOSED'
);

CREATE TABLE sales_orders (
    so_id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id               UUID NOT NULL REFERENCES enterprises(enterprise_id) ON DELETE CASCADE,
    customer_id                   UUID NOT NULL REFERENCES customers(customer_id),
    site_id                         UUID REFERENCES enterprise_sites(site_id) ON DELETE SET NULL,
    so_number                        VARCHAR(100) NOT NULL,
    status                             so_status NOT NULL DEFAULT 'DRAFT',
    order_date                          DATE NOT NULL DEFAULT CURRENT_DATE,
    requested_delivery_date               DATE,
    currency                                VARCHAR(10) DEFAULT 'DZD',
    total_amount                             NUMERIC(18,2) DEFAULT 0,
    notes                                      TEXT,
    created_by                                  UUID REFERENCES users(user_id),
    created_at                                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (enterprise_id, so_number)
);

CREATE TABLE sales_order_lines (
    so_line_id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    so_id                        UUID NOT NULL REFERENCES sales_orders(so_id) ON DELETE CASCADE,
    item_id                        UUID NOT NULL REFERENCES inventory_items(item_id),
    line_number                      INTEGER NOT NULL,
    quantity_ordered                    NUMERIC(18,3) NOT NULL,
    quantity_fulfilled                    NUMERIC(18,3) NOT NULL DEFAULT 0,
    unit_price                              NUMERIC(18,4) NOT NULL,
    line_total                                NUMERIC(18,2) GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED,
    UNIQUE (so_id, line_number)
);

CREATE TYPE fulfillment_status AS ENUM (
    'PENDING', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
);

CREATE TABLE order_fulfillment (
    fulfillment_id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    so_id                          UUID NOT NULL REFERENCES sales_orders(so_id) ON DELETE CASCADE,
    so_line_id                       UUID REFERENCES sales_order_lines(so_line_id) ON DELETE CASCADE,
    status                             fulfillment_status NOT NULL DEFAULT 'PENDING',
    quantity_shipped                     NUMERIC(18,3) NOT NULL DEFAULT 0,
    shipped_date                           DATE,
    delivered_date                           DATE,
    tracking_number                            VARCHAR(150),
    carrier                                      VARCHAR(150),
    notes                                          TEXT,
    created_at                                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                                       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_enterprise ON users(enterprise_id);
CREATE INDEX idx_items_enterprise ON inventory_items(enterprise_id);
CREATE INDEX idx_stock_levels_item ON stock_levels(item_id);
CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX idx_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX idx_vendors_enterprise ON vendors(enterprise_id);
CREATE INDEX idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_lines_po ON purchase_order_lines(po_id);
CREATE INDEX idx_po_lines_item ON purchase_order_lines(item_id);
CREATE INDEX idx_receipts_po ON goods_receipts(po_id);
CREATE INDEX idx_receipt_lines_receipt ON goods_receipt_lines(receipt_id);
CREATE INDEX idx_customers_enterprise ON customers(enterprise_id);
CREATE INDEX idx_so_customer ON sales_orders(customer_id);
CREATE INDEX idx_so_lines_so ON sales_order_lines(so_id);
CREATE INDEX idx_so_lines_item ON sales_order_lines(item_id);
CREATE INDEX idx_fulfillment_so ON order_fulfillment(so_id);

-- ============================================================
-- END OF SCHEMA
-- ============================================================