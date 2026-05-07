-- Move turnover values that were imported into mobile/business_name into total_turnover.

UPDATE beneficiaries
SET
    total_turnover = NULLIF(
        regexp_replace(COALESCE(mobile, business_name, ''), '[^0-9.-]', '', 'g'),
        ''
    )::NUMERIC,
    mobile = NULL,
    business_name = NULL
WHERE
    total_turnover IS NULL
    AND NULLIF(regexp_replace(COALESCE(mobile, business_name, ''), '[^0-9.-]', '', 'g'), '') IS NOT NULL
    AND regexp_replace(COALESCE(mobile, business_name, ''), '[^0-9.-]', '', 'g') ~ '^-?[0-9]+(\.[0-9]+)?$';

-- Beneficiaries are standalone records, so renumber imported rows and reset the sequence.

UPDATE beneficiaries
SET id = -id
WHERE id > 0;

WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id DESC) AS new_id
    FROM beneficiaries
)
UPDATE beneficiaries b
SET id = ordered.new_id
FROM ordered
WHERE b.id = ordered.id;

SELECT setval(
    pg_get_serial_sequence('beneficiaries', 'id'),
    GREATEST(COALESCE((SELECT MAX(id) FROM beneficiaries), 1), 1),
    COALESCE((SELECT MAX(id) FROM beneficiaries), 0) > 0
);
