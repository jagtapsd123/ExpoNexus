-- ============================================================
-- V14__add_district_columns.sql
-- PostgreSQL
-- ============================================================

ALTER TABLE users       ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS district VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_district       ON users(district);
CREATE INDEX IF NOT EXISTS idx_exhibitions_district ON exhibitions(district);
