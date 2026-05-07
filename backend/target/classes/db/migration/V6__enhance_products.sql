-- ============================================================
-- V6__enhance_products.sql
-- PostgreSQL
-- ============================================================

ALTER TABLE products
    ADD COLUMN exhibition_id BIGINT        NULL,
    ADD COLUMN quantity      INT           NOT NULL DEFAULT 0,
    ADD COLUMN sold_quantity INT           NOT NULL DEFAULT 0,
    ADD COLUMN cost_price    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN category      VARCHAR(100)  NULL,
    ADD COLUMN sku           VARCHAR(100)  NULL;

ALTER TABLE products
    ALTER COLUMN stock_status TYPE VARCHAR(20),
    ALTER COLUMN stock_status SET NOT NULL,
    ALTER COLUMN stock_status SET DEFAULT 'IN_STOCK';

ALTER TABLE products
    ADD CONSTRAINT fk_product_exhibition
        FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE SET NULL;

CREATE INDEX idx_products_exhibition ON products(exhibition_id);
