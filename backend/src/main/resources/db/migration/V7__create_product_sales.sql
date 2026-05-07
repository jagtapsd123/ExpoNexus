-- ============================================================
-- V7__create_product_sales.sql
-- PostgreSQL
-- ============================================================

CREATE TABLE product_sales (
    id            BIGSERIAL      NOT NULL,
    exhibitor_id  BIGINT         NOT NULL,
    exhibition_id BIGINT         NOT NULL,
    product_id    BIGINT         NOT NULL,
    quantity      INT            NOT NULL,
    unit_price    DECIMAL(12,2)  NOT NULL,
    total         DECIMAL(12,2)  NOT NULL,
    payment_mode  VARCHAR(50)    NOT NULL DEFAULT 'CASH',
    note          VARCHAR(500),
    sold_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_psale_exhibitor  FOREIGN KEY (exhibitor_id)  REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_psale_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_psale_product    FOREIGN KEY (product_id)    REFERENCES products(id)    ON DELETE CASCADE
);

CREATE INDEX idx_psales_exhibitor  ON product_sales(exhibitor_id);
CREATE INDEX idx_psales_exhibition ON product_sales(exhibition_id);
CREATE INDEX idx_psales_product    ON product_sales(product_id);
CREATE INDEX idx_psales_sold_at    ON product_sales(sold_at);
