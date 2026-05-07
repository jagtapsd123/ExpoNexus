-- ============================================================
-- V5__add_products.sql
-- PostgreSQL
-- ============================================================

CREATE TABLE products (
    id           BIGSERIAL      NOT NULL,
    exhibitor_id BIGINT         NOT NULL,
    name         VARCHAR(200)   NOT NULL,
    description  TEXT,
    price        DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    stock_status VARCHAR(20)    NOT NULL DEFAULT 'IN_STOCK',
    active       BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_exhibitor FOREIGN KEY (exhibitor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_exhibitor    ON products(exhibitor_id);
CREATE INDEX idx_products_stock_status ON products(stock_status);
