-- ============================================================
-- V12__ensure_id_sequences.sql
-- Guarantees that the id_sequences rows required by
-- IdSequenceService exist, even when V2 was skipped because
-- baseline-on-migrate defaulted to version 1.
-- ON CONFLICT (name) DO NOTHING makes it idempotent.
-- ============================================================

-- member_id sequence: next value = MAX existing suffix + 1
INSERT INTO id_sequences (name, next_val)
SELECT 'member_id',
       COALESCE(
           (SELECT MAX(CAST(SUBSTRING(member_id FROM 4) AS BIGINT))
            FROM users
            WHERE member_id IS NOT NULL AND member_id ~ '^MEM[0-9]+$'),
           0) + 1
ON CONFLICT (name) DO NOTHING;

-- event_id sequence: next value = MAX existing suffix + 1
INSERT INTO id_sequences (name, next_val)
SELECT 'event_id',
       COALESCE(
           (SELECT MAX(CAST(SUBSTRING(event_id FROM 4) AS BIGINT))
            FROM exhibitions
            WHERE event_id IS NOT NULL AND event_id ~ '^EVT[0-9]+$'),
           0) + 1
ON CONFLICT (name) DO NOTHING;
