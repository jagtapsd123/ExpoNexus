ALTER TABLE exhibitor_expenses
    ADD COLUMN booking_id BIGINT NULL,
    ADD CONSTRAINT fk_expense_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
