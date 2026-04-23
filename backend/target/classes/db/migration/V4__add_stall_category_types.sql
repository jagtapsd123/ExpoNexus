CREATE TABLE stall_category_types (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_stall_category_type_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stall_category_facilities (
    stall_category_type_id BIGINT NOT NULL,
    facility_id            BIGINT NOT NULL,
    PRIMARY KEY (stall_category_type_id, facility_id),
    CONSTRAINT fk_scf_category FOREIGN KEY (stall_category_type_id) REFERENCES stall_category_types(id) ON DELETE CASCADE,
    CONSTRAINT fk_scf_facility FOREIGN KEY (facility_id) REFERENCES facility_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO stall_category_types (name, description, active) VALUES
  ('Prime', 'Premium location stall category', TRUE),
  ('Super', 'High visibility standard stall category', TRUE),
  ('General', 'General purpose stall category', TRUE);
