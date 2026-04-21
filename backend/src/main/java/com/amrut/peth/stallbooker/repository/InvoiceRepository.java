package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByBookingId(Long bookingId);

    Page<Invoice> findByExhibitorId(Long exhibitorId, Pageable pageable);

    boolean existsByBookingId(Long bookingId);
}
