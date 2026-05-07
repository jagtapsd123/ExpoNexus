-- ============================================================
-- V1__init_schema.sql
-- AMRUT Peth Stall Booker — full initial schema
-- PostgreSQL
-- ============================================================

-- users
CREATE TABLE users (
    id                    BIGSERIAL     NOT NULL,
    name                  VARCHAR(120)  NOT NULL,
    email                 VARCHAR(180)  NOT NULL UNIQUE,
    phone                 VARCHAR(20),
    password_hash         VARCHAR(255)  NOT NULL,
    role                  VARCHAR(20)   NOT NULL DEFAULT 'EXHIBITOR',
    status                VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    profile_image_url     TEXT,
    failed_login_attempts INT           NOT NULL DEFAULT 0,
    locked_until          TIMESTAMP,
    refresh_token         VARCHAR(512),
    refresh_token_expiry  TIMESTAMP,
    created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- exhibitions
CREATE TABLE exhibitions (
    id           BIGSERIAL    NOT NULL,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    venue        VARCHAR(300),
    city         VARCHAR(100),
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'UPCOMING',
    banner_url   TEXT,
    show_revenue BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE INDEX idx_exhibitions_status     ON exhibitions(status);
CREATE INDEX idx_exhibitions_start_date ON exhibitions(start_date);

-- exhibition_organizers (many-to-many)
CREATE TABLE exhibition_organizers (
    exhibition_id BIGINT NOT NULL,
    organizer_id  BIGINT NOT NULL,
    PRIMARY KEY (exhibition_id, organizer_id),
    CONSTRAINT fk_exorg_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_exorg_organizer  FOREIGN KEY (organizer_id)  REFERENCES users(id)       ON DELETE CASCADE
);

-- stall_category_configs (PRIME/SUPER/GENERAL per exhibition)
CREATE TABLE stall_category_configs (
    id            BIGSERIAL      NOT NULL,
    exhibition_id BIGINT         NOT NULL,
    category      VARCHAR(20)    NOT NULL,
    total         INT            NOT NULL DEFAULT 0,
    booked        INT            NOT NULL DEFAULT 0,
    price         DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_scc_exhibition_category UNIQUE (exhibition_id, category),
    CONSTRAINT fk_scc_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
);

-- stalls
CREATE TABLE stalls (
    id            BIGSERIAL      NOT NULL,
    exhibition_id BIGINT         NOT NULL,
    stall_number  VARCHAR(20)    NOT NULL,
    category      VARCHAR(20)    NOT NULL,
    status        VARCHAR(20)    NOT NULL DEFAULT 'AVAILABLE',
    price         DECIMAL(12,2)  NOT NULL,
    length_ft     DECIMAL(6,2),
    width_ft      DECIMAL(6,2),
    description   TEXT,
    booked_by_id  BIGINT,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_stall_number_exhibition UNIQUE (exhibition_id, stall_number),
    CONSTRAINT fk_stall_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_stall_booked_by  FOREIGN KEY (booked_by_id)  REFERENCES users(id)       ON DELETE SET NULL
);

CREATE INDEX idx_stalls_status     ON stalls(status);
CREATE INDEX idx_stalls_exhibition ON stalls(exhibition_id);
CREATE INDEX idx_stalls_category   ON stalls(category);

-- stall_layouts
CREATE TABLE stall_layouts (
    id               BIGSERIAL      NOT NULL,
    exhibition_id    BIGINT         NOT NULL UNIQUE,
    mode             VARCHAR(10)    NOT NULL DEFAULT 'GRID',
    layout_image_url TEXT,
    prime_count      INT            NOT NULL DEFAULT 0,
    super_count      INT            NOT NULL DEFAULT 0,
    general_count    INT            NOT NULL DEFAULT 0,
    prime_price      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    super_price      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    general_price    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_layout_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
);

-- stall_markers
CREATE TABLE stall_markers (
    id         BIGSERIAL        NOT NULL,
    layout_id  BIGINT           NOT NULL,
    number     VARCHAR(20)      NOT NULL,
    category   VARCHAR(20)      NOT NULL,
    price      DECIMAL(12,2)    NOT NULL DEFAULT 0.00,
    status     VARCHAR(20)      NOT NULL DEFAULT 'AVAILABLE',
    x          DOUBLE PRECISION NOT NULL DEFAULT 0,
    y          DOUBLE PRECISION NOT NULL DEFAULT 0,
    w          DOUBLE PRECISION NOT NULL DEFAULT 5,
    h          DOUBLE PRECISION NOT NULL DEFAULT 5,
    created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_marker_layout FOREIGN KEY (layout_id) REFERENCES stall_layouts(id) ON DELETE CASCADE
);

CREATE INDEX idx_marker_layout ON stall_markers(layout_id);

-- invoices
CREATE TABLE invoices (
    id             BIGSERIAL      NOT NULL,
    invoice_number VARCHAR(30)    NOT NULL UNIQUE,
    subtotal       DECIMAL(12,2)  NOT NULL,
    gst_rate       DECIMAL(5,2)   NOT NULL DEFAULT 18.00,
    gst_amount     DECIMAL(12,2)  NOT NULL,
    total          DECIMAL(12,2)  NOT NULL,
    paid           BOOLEAN        NOT NULL DEFAULT FALSE,
    pdf_url        TEXT,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- bookings
CREATE TABLE bookings (
    id                BIGSERIAL      NOT NULL,
    booking_number    VARCHAR(30)    NOT NULL UNIQUE,
    exhibitor_id      BIGINT         NOT NULL,
    stall_id          BIGINT         NOT NULL,
    exhibition_id     BIGINT         NOT NULL,
    days              INT            NOT NULL DEFAULT 1,
    price_per_day     DECIMAL(12,2)  NOT NULL,
    subtotal          DECIMAL(12,2)  NOT NULL,
    gst_amount        DECIMAL(12,2)  NOT NULL,
    total             DECIMAL(12,2)  NOT NULL,
    booking_status    VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    payment_status    VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    payment_method    VARCHAR(20)    NOT NULL DEFAULT 'CASH',
    payment_reference VARCHAR(120),
    notes             TEXT,
    invoice_id        BIGINT         UNIQUE,
    created_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_booking_exhibitor  FOREIGN KEY (exhibitor_id)  REFERENCES users(id)       ON DELETE RESTRICT,
    CONSTRAINT fk_booking_stall      FOREIGN KEY (stall_id)      REFERENCES stalls(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_booking_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_invoice    FOREIGN KEY (invoice_id)    REFERENCES invoices(id)    ON DELETE SET NULL
);

CREATE INDEX idx_bookings_exhibitor      ON bookings(exhibitor_id);
CREATE INDEX idx_bookings_exhibition     ON bookings(exhibition_id);
CREATE INDEX idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- facility_requests
CREATE TABLE facility_requests (
    id                   BIGSERIAL   NOT NULL,
    exhibitor_id         BIGINT      NOT NULL,
    exhibition_id        BIGINT      NOT NULL,
    chairs               INT         NOT NULL DEFAULT 0,
    tables               INT         NOT NULL DEFAULT 0,
    lights               INT         NOT NULL DEFAULT 0,
    electricity_required BOOLEAN     NOT NULL DEFAULT FALSE,
    custom_requirements  TEXT,
    status               VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    fulfilled_by_note    TEXT,
    created_at           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_fr_exhibitor  FOREIGN KEY (exhibitor_id)  REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_fr_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
);

CREATE INDEX idx_fr_exhibitor  ON facility_requests(exhibitor_id);
CREATE INDEX idx_fr_exhibition ON facility_requests(exhibition_id);

-- complaints
CREATE TABLE complaints (
    id              BIGSERIAL    NOT NULL,
    exhibitor_id    BIGINT       NOT NULL,
    subject         VARCHAR(255) NOT NULL,
    description     TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    resolution_note TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_complaint_exhibitor FOREIGN KEY (exhibitor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_complaints_exhibitor ON complaints(exhibitor_id);
CREATE INDEX idx_complaints_status    ON complaints(status);

-- gallery_images
CREATE TABLE gallery_images (
    id            BIGSERIAL   NOT NULL,
    image_url     TEXT        NOT NULL,
    image_type    VARCHAR(20) NOT NULL,
    exhibition_id BIGINT,
    sort_order    INT         NOT NULL DEFAULT 0,
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_gallery_exhibition FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
);

CREATE INDEX idx_gallery_type       ON gallery_images(image_type);
CREATE INDEX idx_gallery_exhibition ON gallery_images(exhibition_id);

-- landing_settings (singleton — always one row)
CREATE TABLE landing_settings (
    id                  BIGSERIAL    NOT NULL,
    title_en            VARCHAR(200) NOT NULL DEFAULT 'AMRUT PETH',
    title_mr            VARCHAR(200) NOT NULL DEFAULT 'अमृत पेठ',
    subtitle_en         VARCHAR(300) NOT NULL DEFAULT 'Direct Market Management System',
    subtitle_mr         VARCHAR(300) NOT NULL DEFAULT 'थेट बाजार व्यवस्थापन प्रणाली',
    description         TEXT,
    phone               VARCHAR(20),
    email               VARCHAR(180),
    address             TEXT,
    ecommerce_url       TEXT,
    stat_exhibitors     INT          NOT NULL DEFAULT 0,
    stat_exhibitions    INT          NOT NULL DEFAULT 0,
    stat_districts      INT          NOT NULL DEFAULT 0,
    hero_background_url TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Seed: default admin (Password: Admin@123, BCrypt strength 12)
INSERT INTO users (name, email, phone, password_hash, role, status)
VALUES (
    'System Administrator',
    'admin@amrutpeth.com',
    '9999999999',
    '$2a$12$XAo8n8LlRe7S6KhNTb.7g.8J/HHJ/Hd.m2xGnf3W7j5Q4oZkGTIq6',
    'ADMIN',
    'APPROVED'
);

-- Seed: default landing settings
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
