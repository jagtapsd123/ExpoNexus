-- ============================================================
-- V3__add_facility_types.sql
-- Facility master list + stall-level facility assignments
-- ============================================================

CREATE TABLE facility_types (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(20)  NOT NULL DEFAULT '⚡',
    description VARCHAR(300),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_facility_type_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stall_facilities (
    stall_id    BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    PRIMARY KEY (stall_id, facility_id),
    CONSTRAINT fk_sf_stall    FOREIGN KEY (stall_id)    REFERENCES stalls(id)         ON DELETE CASCADE,
    CONSTRAINT fk_sf_facility FOREIGN KEY (facility_id) REFERENCES facility_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_sf_facility ON stall_facilities(facility_id);

INSERT INTO facility_types (name, icon, description) VALUES
  ('Electricity', '⚡', 'Power connection for the stall'),
  ('Chair',       '🪑', 'Seating chair provided'),
  ('Table',       '🪵', 'Display or work table'),
  ('WiFi',        '📶', 'Wireless internet access'),
  ('Storage',     '📦', 'Storage space behind or under the stall'),
  ('Fan',         '🌀', 'Ceiling or stand fan'),
  ('Lighting',    '💡', 'Overhead or spotlight lighting');
