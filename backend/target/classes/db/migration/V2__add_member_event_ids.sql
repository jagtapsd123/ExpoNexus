-- ============================================================
-- V2__add_member_event_ids.sql
-- Adds memberId to users, eventId to exhibitions,
-- a concurrency-safe sequences table, and backfills existing rows.
-- MySQL 8.x  (uses ROW_NUMBER() window function)
-- ============================================================

-- -------------------------------------------------------
-- 1. Concurrency-safe sequences table
-- -------------------------------------------------------
CREATE TABLE id_sequences (
    name      VARCHAR(50) NOT NULL,
    next_val  BIGINT      NOT NULL DEFAULT 1,
    PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 2. Add columns (nullable first so backfill can run)
-- -------------------------------------------------------
ALTER TABLE users
    ADD COLUMN member_id VARCHAR(10) NULL UNIQUE AFTER email;

ALTER TABLE exhibitions
    ADD COLUMN event_id VARCHAR(10) NULL UNIQUE AFTER name;

-- -------------------------------------------------------
-- 3. Backfill existing users  →  MEM0001, MEM0002 …
-- -------------------------------------------------------
UPDATE users u
JOIN (
    SELECT id,
           CONCAT('MEM', LPAD(ROW_NUMBER() OVER (ORDER BY id), 4, '0')) AS new_member_id
    FROM   users
) ranked ON u.id = ranked.id
SET u.member_id = ranked.new_member_id;

-- -------------------------------------------------------
-- 4. Backfill existing exhibitions  →  EVT0001, EVT0002 …
-- -------------------------------------------------------
UPDATE exhibitions e
JOIN (
    SELECT id,
           CONCAT('EVT', LPAD(ROW_NUMBER() OVER (ORDER BY id), 4, '0')) AS new_event_id
    FROM   exhibitions
) ranked ON e.id = ranked.id
SET e.event_id = ranked.new_event_id;

-- -------------------------------------------------------
-- 5. Seed sequences with next available value
--    COALESCE handles the case of an empty table (fresh install)
-- -------------------------------------------------------
INSERT INTO id_sequences (name, next_val)
SELECT 'member_id',
       COALESCE(MAX(CAST(SUBSTRING(member_id, 4) AS UNSIGNED)), 0) + 1
FROM   users;

INSERT INTO id_sequences (name, next_val)
SELECT 'event_id',
       COALESCE(MAX(CAST(SUBSTRING(event_id, 4) AS UNSIGNED)), 0) + 1
FROM   exhibitions;

-- -------------------------------------------------------
-- 6. Enforce NOT NULL now that all rows are populated
-- -------------------------------------------------------
ALTER TABLE users
    MODIFY COLUMN member_id VARCHAR(10) NOT NULL;

ALTER TABLE exhibitions
    MODIFY COLUMN event_id VARCHAR(10) NOT NULL;

-- -------------------------------------------------------
-- 7. Indexes for admin search
-- -------------------------------------------------------
CREATE INDEX idx_users_member_id       ON users(member_id);
CREATE INDEX idx_exhibitions_event_id  ON exhibitions(event_id);
