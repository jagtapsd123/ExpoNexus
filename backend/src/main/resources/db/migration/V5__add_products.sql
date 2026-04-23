-- ============================================================
-- V5__add_products.sql
-- Exhibitor product catalogue
-- ============================================================

CREATE TABLE products (
    id           BIGINT          NOT NULL AUTO_INCREMENT,
    exhibitor_id BIGINT          NOT NULL,
    name         VARCHAR(200)    NOT NULL,
    description  TEXT,
    price        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    stock_status ENUM('IN_STOCK','OUT_OF_STOCK') NOT NULL DEFAULT 'IN_STOCK',
    active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_product_exhibitor FOREIGN KEY (exhibitor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_products_exhibitor    ON products(exhibitor_id);
CREATE INDEX idx_products_stock_status ON products(stock_status);
