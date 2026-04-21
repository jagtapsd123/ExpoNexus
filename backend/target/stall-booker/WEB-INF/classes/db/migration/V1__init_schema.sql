-- ============================================================
-- V1__init_schema.sql
-- AMRUT Peth Stall Booker — full initial schema
-- MySQL 8.x
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+05:30';

-- -------------------------------------------------------
-- users
-- -------------------------------------------------------
CREATE TABLE users (
    id                   BIGINT        NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(120)  NOT NULL,
    email                VARCHAR(180)  NOT NULL UNIQUE,
    phone                VARCHAR(20),
    password_hash        VARCHAR(255)  NOT NULL,
    role                 ENUM('ADMIN','ORGANIZER','EXHIBITOR') NOT NULL DEFAULT 'EXHIBITOR',
    status               ENUM('PENDING','APPROVED','REJECTED')  NOT NULL DEFAULT 'PENDING',
    profile_image_url    TEXT,
    failed_login_attempts INT          NOT NULL DEFAULT 0,
    locked_until         DATETIME(6),
    refresh_token        VARCHAR(512),
    refresh_token_expiry DATETIME(6),
    created_at           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- -------------------------------------------------------
-- exhibitions
-- -------------------------------------------------------
CREATE TABLE exhibitions (
    id                   BIGINT        NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(200)  NOT NULL,
    description          TEXT,
    venue                VARCHAR(300),
    city                 VARCHAR(100),
    start_date           DATE          NOT NULL,
    end_date             DATE          NOT NULL,
    status               ENUM('UPCOMING','ONGOING','COMPLETED') NOT NULL DEFAULT 'UPCOMING',
    banner_url           TEXT,
    show_revenue         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_exhibitions_status     ON exhibitions(status);
CREATE INDEX idx_exhibitions_start_date ON exhibitions(start_date);

-- -------------------------------------------------------
-- exhibition_organizers  (many-to-many)
-- -------------------------------------------------------
CREATE TABLE exhibition_organizers (
    exhibition_id BIGINT NOT NULL,
    organizer_id  BIGINT NOT NULL,
    PRIMARY KEY (exhibition_id, organizer_id),
    CONSTRAINT fk_exorg_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_exorg_organizer  FOREIGN KEY (organizer_id)  REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- stall_category_configs  (PRIME/SUPER/GENERAL per exhibition)
-- -------------------------------------------------------
CREATE TABLE stall_category_configs (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    exhibition_id BIGINT          NOT NULL,
    category      ENUM('PRIME','SUPER','GENERAL') NOT NULL,
    total         INT             NOT NULL DEFAULT 0,
    booked        INT             NOT NULL DEFAULT 0,
    price         DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    created_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_scc_exhibition_category (exhibition_id, category),
    CONSTRAINT fk_scc_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- stalls
-- -------------------------------------------------------
CREATE TABLE stalls (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    exhibition_id BIGINT          NOT NULL,
    stall_number  VARCHAR(20)     NOT NULL,
    category      ENUM('PRIME','SUPER','GENERAL') NOT NULL,
    status        ENUM('AVAILABLE','BOOKED','RESERVED','BLOCKED','UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    price         DECIMAL(12,2)   NOT NULL,
    length_ft     DECIMAL(6,2),
    width_ft      DECIMAL(6,2),
    description   TEXT,
    booked_by_id  BIGINT,
    created_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_stall_number_exhibition (exhibition_id, stall_number),
    CONSTRAINT fk_stall_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_stall_booked_by  FOREIGN KEY (booked_by_id)  REFERENCES users(id)       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_stalls_status       ON stalls(status);
CREATE INDEX idx_stalls_exhibition   ON stalls(exhibition_id);
CREATE INDEX idx_stalls_category     ON stalls(category);

-- -------------------------------------------------------
-- stall_layouts
-- -------------------------------------------------------
CREATE TABLE stall_layouts (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    exhibition_id    BIGINT          NOT NULL UNIQUE,
    mode             ENUM('GRID','IMAGE') NOT NULL DEFAULT 'GRID',
    layout_image_url TEXT,
    prime_count      INT             NOT NULL DEFAULT 0,
    super_count      INT             NOT NULL DEFAULT 0,
    general_count    INT             NOT NULL DEFAULT 0,
    prime_price      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    super_price      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    general_price    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    created_at       DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_layout_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- stall_markers
-- -------------------------------------------------------
CREATE TABLE stall_markers (
    id         BIGINT          NOT NULL AUTO_INCREMENT,
    layout_id  BIGINT          NOT NULL,
    number     VARCHAR(20)     NOT NULL,
    category   ENUM('PRIME','SUPER','GENERAL') NOT NULL,
    price      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    status     ENUM('AVAILABLE','BOOKED','RESERVED','BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    x          DOUBLE          NOT NULL DEFAULT 0,
    y          DOUBLE          NOT NULL DEFAULT 0,
    w          DOUBLE          NOT NULL DEFAULT 5,
    h          DOUBLE          NOT NULL DEFAULT 5,
    created_at DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_marker_layout FOREIGN KEY (layout_id) REFERENCES stall_layouts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_marker_layout ON stall_markers(layout_id);

-- -------------------------------------------------------
-- invoices  (created before bookings due to FK reference)
-- -------------------------------------------------------
CREATE TABLE invoices (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    invoice_number VARCHAR(30)     NOT NULL UNIQUE,
    subtotal       DECIMAL(12,2)   NOT NULL,
    gst_rate       DECIMAL(5,2)    NOT NULL DEFAULT 18.00,
    gst_amount     DECIMAL(12,2)   NOT NULL,
    total          DECIMAL(12,2)   NOT NULL,
    paid           BOOLEAN         NOT NULL DEFAULT FALSE,
    pdf_url        TEXT,
    created_at     DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- bookings
-- -------------------------------------------------------
CREATE TABLE bookings (
    id               BIGINT          NOT NULL AUTO_INCREMENT,
    booking_number   VARCHAR(30)     NOT NULL UNIQUE,
    exhibitor_id     BIGINT          NOT NULL,
    stall_id         BIGINT          NOT NULL,
    exhibition_id    BIGINT          NOT NULL,
    days             INT             NOT NULL DEFAULT 1,
    price_per_day    DECIMAL(12,2)   NOT NULL,
    subtotal         DECIMAL(12,2)   NOT NULL,
    gst_amount       DECIMAL(12,2)   NOT NULL,
    total            DECIMAL(12,2)   NOT NULL,
    booking_status   ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    payment_status   ENUM('PENDING','PAID','REFUNDED','FAILED')          NOT NULL DEFAULT 'PENDING',
    payment_method   ENUM('CASH','ONLINE','UPI','BANK_TRANSFER')         NOT NULL DEFAULT 'CASH',
    payment_reference VARCHAR(120),
    notes            TEXT,
    invoice_id       BIGINT          UNIQUE,
    created_at       DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_booking_exhibitor  FOREIGN KEY (exhibitor_id)  REFERENCES users(id)       ON DELETE RESTRICT,
    CONSTRAINT fk_booking_stall      FOREIGN KEY (stall_id)      REFERENCES stalls(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_booking_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_invoice    FOREIGN KEY (invoice_id)    REFERENCES invoices(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bookings_exhibitor       ON bookings(exhibitor_id);
CREATE INDEX idx_bookings_exhibition      ON bookings(exhibition_id);
CREATE INDEX idx_bookings_booking_status  ON bookings(booking_status);
CREATE INDEX idx_bookings_payment_status  ON bookings(payment_status);

-- -------------------------------------------------------
-- facility_requests
-- -------------------------------------------------------
CREATE TABLE facility_requests (
    id                   BIGINT          NOT NULL AUTO_INCREMENT,
    exhibitor_id         BIGINT          NOT NULL,
    exhibition_id        BIGINT          NOT NULL,
    chairs               INT             NOT NULL DEFAULT 0,
    tables               INT             NOT NULL DEFAULT 0,
    lights               INT             NOT NULL DEFAULT 0,
    electricity_required BOOLEAN         NOT NULL DEFAULT FALSE,
    custom_requirements  TEXT,
    status               ENUM('PENDING','FULFILLED','REJECTED') NOT NULL DEFAULT 'PENDING',
    fulfilled_by_note    TEXT,
    created_at           DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_fr_exhibitor  FOREIGN KEY (exhibitor_id)  REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_fr_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_fr_exhibitor  ON facility_requests(exhibitor_id);
CREATE INDEX idx_fr_exhibition ON facility_requests(exhibition_id);

-- -------------------------------------------------------
-- complaints
-- -------------------------------------------------------
CREATE TABLE complaints (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    exhibitor_id    BIGINT          NOT NULL,
    subject         VARCHAR(255)    NOT NULL,
    description     TEXT            NOT NULL,
    status          ENUM('OPEN','IN_PROGRESS','RESOLVED') NOT NULL DEFAULT 'OPEN',
    resolution_note TEXT,
    created_at      DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_complaint_exhibitor FOREIGN KEY (exhibitor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_complaints_exhibitor ON complaints(exhibitor_id);
CREATE INDEX idx_complaints_status    ON complaints(status);

-- -------------------------------------------------------
-- gallery_images  (shared for EXHIBITION and LANDING types)
-- -------------------------------------------------------
CREATE TABLE gallery_images (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    image_url     TEXT            NOT NULL,
    image_type    ENUM('EXHIBITION','LANDING') NOT NULL,
    exhibition_id BIGINT,
    sort_order    INT             NOT NULL DEFAULT 0,
    created_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_gallery_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_gallery_type       ON gallery_images(image_type);
CREATE INDEX idx_gallery_exhibition ON gallery_images(exhibition_id);

-- -------------------------------------------------------
-- landing_settings  (singleton — always one row)
-- -------------------------------------------------------
CREATE TABLE landing_settings (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    title_en            VARCHAR(200)    NOT NULL DEFAULT 'AMRUT PETH',
    title_mr            VARCHAR(200)    NOT NULL DEFAULT 'अमृत पेठ',
    subtitle_en         VARCHAR(300)    NOT NULL DEFAULT 'Direct Market Management System',
    subtitle_mr         VARCHAR(300)    NOT NULL DEFAULT 'थेट बाजार व्यवस्थापन प्रणाली',
    description         TEXT,
    phone               VARCHAR(20),
    email               VARCHAR(180),
    address             TEXT,
    ecommerce_url       TEXT,
    stat_exhibitors     INT             NOT NULL DEFAULT 0,
    stat_exhibitions    INT             NOT NULL DEFAULT 0,
    stat_districts      INT             NOT NULL DEFAULT 0,
    hero_background_url TEXT,
    created_at          DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed data
-- ============================================================

-- Default admin user
-- Password: Admin@123  (BCrypt strength 12)
INSERT INTO users (name, email, phone, password_hash, role, status)
VALUES (
    'System Administrator',
    'admin@amrutpeth.com',
    '9999999999',
    '$2a$12$XAo8n8LlRe7S6KhNTb.7g.8J/HHJ/Hd.m2xGnf3W7j5Q4oZkGTIq6',
    'ADMIN',
    'APPROVED'
);

-- Default landing settings row (singleton)
INSERT INTO landing_settings (
    title_en, title_mr, subtitle_en, subtitle_mr, description,
    phone, email, address, stat_exhibitors, stat_exhibitions, stat_districts
) VALUES (
    'AMRUT PETH',
    'अमृत पेठ',
    'Direct Market Management System',
    'थेट बाजार व्यवस्थापन प्रणाली',
    'AMRUT PETH is Maharashtra''s premier direct market management platform, connecting local artisans and producers with consumers through well-organized exhibitions.',
    '+91 99999 99999',
    'info@amrutpeth.com',
    'Pune, Maharashtra, India',
    500,
    50,
    33
);
