-- ============================================================
-- V7__create_product_sales.sql
-- Track individual product sale transactions
-- ============================================================

CREATE TABLE product_sales (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    exhibitor_id  BIGINT        NOT NULL,
    exhibition_id BIGINT        NOT NULL,
    product_id    BIGINT        NOT NULL,
    quantity      INT           NOT NULL,
    unit_price    DECIMAL(12,2) NOT NULL,
    total         DECIMAL(12,2) NOT NULL,
    payment_mode  VARCHAR(50)   NOT NULL DEFAULT 'CASH',
    note          VARCHAR(500),
    sold_at       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_psale_exhibitor  FOREIGN KEY (exhibitor_id)  REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT fk_psale_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id)  ON DELETE CASCADE,
    CONSTRAINT fk_psale_product    FOREIGN KEY (product_id)    REFERENCES products(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_psales_exhibitor  ON product_sales(exhibitor_id);
CREATE INDEX idx_psales_exhibition ON product_sales(exhibition_id);
CREATE INDEX idx_psales_product    ON product_sales(product_id);
CREATE INDEX idx_psales_sold_at    ON product_sales(sold_at);
