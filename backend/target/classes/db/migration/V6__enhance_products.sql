-- ============================================================
-- V6__enhance_products.sql
-- Add quantity tracking, cost price, exhibition link, SKU, category
-- ============================================================

ALTER TABLE products
    ADD COLUMN exhibition_id BIGINT       NULL        AFTER exhibitor_id,
    ADD COLUMN quantity      INT          NOT NULL DEFAULT 0 AFTER description,
    ADD COLUMN sold_quantity INT          NOT NULL DEFAULT 0 AFTER quantity,
    ADD COLUMN cost_price    DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER price,
    ADD COLUMN category      VARCHAR(100) NULL AFTER cost_price,
    ADD COLUMN sku           VARCHAR(100) NULL AFTER category,
    MODIFY COLUMN stock_status VARCHAR(20) NOT NULL DEFAULT 'IN_STOCK';

ALTER TABLE products
    ADD CONSTRAINT fk_product_exhibition
        FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE SET NULL;

CREATE INDEX idx_products_exhibition ON products(exhibition_id);
