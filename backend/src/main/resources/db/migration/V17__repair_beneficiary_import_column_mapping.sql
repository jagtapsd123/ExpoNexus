-- Repair rows imported by the earlier column mapping:
-- address went into name, stall number went into mobile, name went into address,
-- and exhibition date text went into category.

UPDATE beneficiaries
SET
    name = address,
    address = name,
    stall_number = mobile,
    exhibition_date = category,
    mobile = NULL,
    category = NULL
WHERE
    exhibition_date IS NULL
    AND stall_number IS NULL
    AND mobile IS NOT NULL
    AND address IS NOT NULL
    AND category IS NOT NULL
    AND (
        category ILIKE '%april%'
        OR category ILIKE '%may%'
        OR category ILIKE '%june%'
        OR category ILIKE '%july%'
        OR category ILIKE '%august%'
        OR category ILIKE '%september%'
        OR category ILIKE '%october%'
        OR category ILIKE '%november%'
        OR category ILIKE '%december%'
        OR category ILIKE '%january%'
        OR category ILIKE '%february%'
        OR category ILIKE '%march%'
        OR category LIKE '%एप्रिल%'
        OR category LIKE '%मे%'
        OR category LIKE '%जून%'
        OR category LIKE '%जुलै%'
        OR category LIKE '%ऑगस्ट%'
        OR category LIKE '%सप्टेंबर%'
        OR category LIKE '%ऑक्टोबर%'
        OR category LIKE '%नोव्हेंबर%'
        OR category LIKE '%डिसेंबर%'
        OR category LIKE '%जानेवारी%'
        OR category LIKE '%फेब्रुवारी%'
        OR category LIKE '%मार्च%'
        OR category LIKE '%२०%'
        OR category LIKE '%20%'
    );
