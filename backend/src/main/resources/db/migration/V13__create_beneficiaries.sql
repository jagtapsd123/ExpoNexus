-- ============================================================
-- V13__create_beneficiaries.sql
-- PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS beneficiaries (
    id               BIGSERIAL    PRIMARY KEY,
    name             VARCHAR(200) NOT NULL,
    mobile           VARCHAR(20),
    address          VARCHAR(500),
    category         VARCHAR(100),
    business_name    VARCHAR(200),
    business_type    VARCHAR(100),
    beneficiary_code VARCHAR(50)  UNIQUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_name     ON beneficiaries(name);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON beneficiaries(category);
