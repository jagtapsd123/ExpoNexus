package com.amrut.peth.stallbooker.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class NumberGenerator {

    private final AtomicLong counter = new AtomicLong(System.currentTimeMillis() % 10000);

    public String generateBookingNumber() {
        int year = LocalDate.now().getYear();
        long seq = counter.incrementAndGet() % 10000;
        return String.format("BK-%d-%04d", year, seq);
    }

    public String generateInvoiceNumber() {
        int year = LocalDate.now().getYear();
        long seq = counter.incrementAndGet() % 10000;
        return String.format("INV-%d-%04d", year, seq);
    }
}
