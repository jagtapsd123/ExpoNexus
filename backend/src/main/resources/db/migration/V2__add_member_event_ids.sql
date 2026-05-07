-- ============================================================
-- V2__add_member_event_ids.sql
-- PostgreSQL
-- ============================================================

-- 1. Concurrency-safe sequences table
CREATE TABLE id_sequences (
    name     VARCHAR(50) NOT NULL,
    next_val BIGINT      NOT NULL DEFAULT 1,
    PRIMARY KEY (name)
);

-- 2. Add columns nullable first so backfill can run
ALTER TABLE users       ADD COLUMN member_id VARCHAR(10) NULL UNIQUE;
ALTER TABLE exhibitions ADD COLUMN event_id  VARCHAR(10) NULL UNIQUE;

-- 3. Backfill existing users  MEM0001, MEM0002
UPDATE users u
SET member_id = ranked.new_member_id
FROM (
    SELECT id,
           'MEM' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY id) AS TEXT), 4, '0') AS new_member_id
    FROM users
) ranked
WHERE u.id = ranked.id;

-- 4. Backfill existing exhibitions  EVT0001, EVT0002
UPDATE exhibitions e
SET event_id = ranked.new_event_id
FROM (
    SELECT id,
           'EVT' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY id) AS TEXT), 4, '0') AS new_event_id
    FROM exhibitions
) ranked
WHERE e.id = ranked.id;

-- 5. Seed sequences with next available value
INSERT INTO id_sequences (name, next_val)
SELECT 'member_id',
       COALESCE(MAX(CAST(SUBSTRING(member_id FROM 4) AS BIGINT)), 0) + 1
FROM users;

INSERT INTO id_sequences (name, next_val)
SELECT 'event_id',
       COALESCE(MAX(CAST(SUBSTRING(event_id FROM 4) AS BIGINT)), 0) + 1
FROM exhibitions;

-- 6. Enforce NOT NULL now that all rows are populated
ALTER TABLE users       ALTER COLUMN member_id SET NOT NULL;
ALTER TABLE exhibitions ALTER COLUMN event_id  SET NOT NULL;

-- 7. Indexes
CREATE INDEX idx_users_member_id      ON users(member_id);
CREATE INDEX idx_exhibitions_event_id ON exhibitions(event_id);
