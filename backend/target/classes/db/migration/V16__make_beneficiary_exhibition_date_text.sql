-- Exhibition dates in the imported beneficiary sheet can be date ranges or Marathi text,
-- so keep the original cell value instead of forcing it into a single DATE.

ALTER TABLE beneficiaries
    ADD COLUMN IF NOT EXISTS exhibition_date VARCHAR(100);

ALTER TABLE beneficiaries
    ALTER COLUMN exhibition_date TYPE VARCHAR(100)
    USING exhibition_date::VARCHAR;
