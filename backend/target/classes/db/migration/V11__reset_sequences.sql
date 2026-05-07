-- ============================================================
-- V11__reset_sequences.sql
-- Resets all BIGSERIAL sequences to MAX(id) so the next
-- generated id never collides with seeded rows.
-- Safe to run on an empty table (COALESCE handles 0 rows).
-- ============================================================

SELECT setval(pg_get_serial_sequence('users',                  'id'), COALESCE(MAX(id), 0) + 1, false) FROM users;
SELECT setval(pg_get_serial_sequence('exhibitions',            'id'), COALESCE(MAX(id), 0) + 1, false) FROM exhibitions;
SELECT setval(pg_get_serial_sequence('stall_category_configs', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM stall_category_configs;
SELECT setval(pg_get_serial_sequence('stalls',                 'id'), COALESCE(MAX(id), 0) + 1, false) FROM stalls;
SELECT setval(pg_get_serial_sequence('stall_layouts',          'id'), COALESCE(MAX(id), 0) + 1, false) FROM stall_layouts;
SELECT setval(pg_get_serial_sequence('stall_markers',          'id'), COALESCE(MAX(id), 0) + 1, false) FROM stall_markers;
SELECT setval(pg_get_serial_sequence('invoices',               'id'), COALESCE(MAX(id), 0) + 1, false) FROM invoices;
SELECT setval(pg_get_serial_sequence('bookings',               'id'), COALESCE(MAX(id), 0) + 1, false) FROM bookings;
SELECT setval(pg_get_serial_sequence('facility_requests',      'id'), COALESCE(MAX(id), 0) + 1, false) FROM facility_requests;
SELECT setval(pg_get_serial_sequence('complaints',             'id'), COALESCE(MAX(id), 0) + 1, false) FROM complaints;
SELECT setval(pg_get_serial_sequence('gallery_images',         'id'), COALESCE(MAX(id), 0) + 1, false) FROM gallery_images;
SELECT setval(pg_get_serial_sequence('landing_settings',       'id'), COALESCE(MAX(id), 0) + 1, false) FROM landing_settings;
SELECT setval(pg_get_serial_sequence('facility_types',         'id'), COALESCE(MAX(id), 0) + 1, false) FROM facility_types;
SELECT setval(pg_get_serial_sequence('stall_category_types',   'id'), COALESCE(MAX(id), 0) + 1, false) FROM stall_category_types;
SELECT setval(pg_get_serial_sequence('products',               'id'), COALESCE(MAX(id), 0) + 1, false) FROM products;
SELECT setval(pg_get_serial_sequence('product_sales',          'id'), COALESCE(MAX(id), 0) + 1, false) FROM product_sales;
SELECT setval(pg_get_serial_sequence('exhibitor_expenses',     'id'), COALESCE(MAX(id), 0) + 1, false) FROM exhibitor_expenses;
