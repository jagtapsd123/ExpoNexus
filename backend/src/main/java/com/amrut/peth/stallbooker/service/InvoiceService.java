package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.response.InvoiceDto;
import com.amrut.peth.stallbooker.entity.Booking;
import com.amrut.peth.stallbooker.entity.Invoice;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ForbiddenException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.BookingRepository;
import com.amrut.peth.stallbooker.repository.InvoiceRepository;
import com.amrut.peth.stallbooker.util.NumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final NumberGenerator numberGenerator;

    public InvoiceService(InvoiceRepository invoiceRepository, BookingRepository bookingRepository,
			NumberGenerator numberGenerator) {
		super();
		this.invoiceRepository = invoiceRepository;
		this.bookingRepository = bookingRepository;
		this.numberGenerator = numberGenerator;
	}

	@Transactional(readOnly = true)
    public Page<InvoiceDto> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(InvoiceDto::from);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDto> getForExhibitor(Long exhibitorId, Pageable pageable) {
        return invoiceRepository.findByExhibitorId(exhibitorId, pageable).map(InvoiceDto::from);
    }

    @Transactional(readOnly = true)
    public InvoiceDto getById(Long id, User currentUser) {
        Invoice invoice = findOrThrow(id);
        if (currentUser.getRole() == User.Role.EXHIBITOR
            && !invoice.getExhibitor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Access denied to this invoice");
        }
        return InvoiceDto.from(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceDto getByBookingId(Long bookingId, User currentUser) {
        Invoice invoice = invoiceRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice for booking " + bookingId + " not found"));
        if (currentUser.getRole() == User.Role.EXHIBITOR
            && !invoice.getExhibitor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Access denied");
        }
        return InvoiceDto.from(invoice);
    }

    @Transactional
    public InvoiceDto generateForBooking(Long bookingId) {
        if (invoiceRepository.existsByBookingId(bookingId)) {
            throw new BadRequestException("Invoice already exists for booking " + bookingId);
        }
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new BadRequestException("Invoice can only be generated for confirmed bookings");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(numberGenerator.generateInvoiceNumber());
        invoice.setBooking(booking);
        invoice.setExhibitor(booking.getExhibitor());
        invoice.setGeneratedAt(LocalDate.now());
        invoice.setSubtotal(booking.getSubtotal());
        invoice.setGst(booking.getGst());
        invoice.setGstRate(18.0);
        invoice.setTotal(booking.getTotal());
        invoice.setPaid(booking.getPaymentStatus() == Booking.PaymentStatus.PAID);
            

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice generated: {} for booking {}", saved.getInvoiceNumber(), booking.getBookingNumber());
        return InvoiceDto.from(saved);
    }

    private Invoice findOrThrow(Long id) {
        return invoiceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }
}
