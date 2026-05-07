-- Add columns used by the beneficiary Excel import.
-- V13 may already be applied in existing databases, so keep this forward migration additive.

ALTER TABLE beneficiaries
    ADD COLUMN IF NOT EXISTS stall_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS exhibition_date VARCHAR(100),
    ADD COLUMN IF NOT EXISTS total_turnover NUMERIC(15, 2);
