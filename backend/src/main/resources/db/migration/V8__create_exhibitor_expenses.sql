-- ============================================================
-- V8__create_exhibitor_expenses.sql
-- Track exhibitor expenses per exhibition
-- ============================================================

CREATE TABLE exhibitor_expenses (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    exhibitor_id  BIGINT        NOT NULL,
    exhibition_id BIGINT        NULL,
    type          VARCHAR(100)  NOT NULL,
    amount        DECIMAL(12,2) NOT NULL,
    note          VARCHAR(500),
    expense_date  DATE          NOT NULL,
    created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_expense_exhibitor  FOREIGN KEY (exhibitor_id)  REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT fk_expense_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_expenses_exhibitor  ON exhibitor_expenses(exhibitor_id);
CREATE INDEX idx_expenses_exhibition ON exhibitor_expenses(exhibition_id);
CREATE INDEX idx_expenses_date       ON exhibitor_expenses(expense_date);
