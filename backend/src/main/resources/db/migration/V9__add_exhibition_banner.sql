-- ============================================================
-- V9__add_exhibition_banner.sql
-- Add banner image URL to exhibitions
-- ============================================================

ALTER TABLE exhibitions
    ADD COLUMN banner_image_url VARCHAR(1000) NULL,
    ADD COLUMN organizer_name   VARCHAR(300)  NULL;
