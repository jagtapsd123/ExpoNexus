-- ============================================================
-- V3__add_facility_types.sql
-- PostgreSQL
-- ============================================================

CREATE TABLE facility_types (
    id          BIGSERIAL    NOT NULL,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(20)  NOT NULL DEFAULT '?',
    description VARCHAR(300),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_facility_type_name UNIQUE (name)
);

CREATE TABLE stall_facilities (
    stall_id    BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    PRIMARY KEY (stall_id, facility_id),
    CONSTRAINT fk_sf_stall    FOREIGN KEY (stall_id)    REFERENCES stalls(id)         ON DELETE CASCADE,
    CONSTRAINT fk_sf_facility FOREIGN KEY (facility_id) REFERENCES facility_types(id) ON DELETE CASCADE
);

CREATE INDEX idx_sf_facility ON stall_facilities(facility_id);

INSERT INTO facility_types (name, icon, description) VALUES
  ('Electricity', 'zap',     'Power connection for the stall'),
  ('Chair',       'chair',   'Seating chair provided'),
  ('Table',       'table',   'Display or work table'),
  ('WiFi',        'wifi',    'Wireless internet access'),
  ('Storage',     'box',     'Storage space behind or under the stall'),
  ('Fan',         'wind',    'Ceiling or stand fan'),
  ('Lighting',    'lamp',    'Overhead or spotlight lighting');
