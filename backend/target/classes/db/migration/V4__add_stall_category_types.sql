-- ============================================================
-- V4__add_stall_category_types.sql
-- PostgreSQL
-- ============================================================

CREATE TABLE stall_category_types (
    id          BIGSERIAL    NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_stall_category_type_name UNIQUE (name)
);

CREATE TABLE stall_category_facilities (
    stall_category_type_id BIGINT NOT NULL,
    facility_id            BIGINT NOT NULL,
    PRIMARY KEY (stall_category_type_id, facility_id),
    CONSTRAINT fk_scf_category FOREIGN KEY (stall_category_type_id) REFERENCES stall_category_types(id) ON DELETE CASCADE,
    CONSTRAINT fk_scf_facility FOREIGN KEY (facility_id)             REFERENCES facility_types(id)       ON DELETE CASCADE
);

INSERT INTO stall_category_types (name, description, active) VALUES
  ('Prime',   'Premium location stall category',            TRUE),
  ('Super',   'High visibility standard stall category',    TRUE),
  ('General', 'General purpose stall category',             TRUE);
