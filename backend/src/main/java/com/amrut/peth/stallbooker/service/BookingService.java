package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateBookingRequest;

import com.amrut.peth.stallbooker.dto.response.BookingDto;
import com.amrut.peth.stallbooker.entity.*;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ForbiddenException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.*;
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
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service

public class BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    public BookingService(BookingRepository bookingRepository, ExhibitionRepository exhibitionRepository,
			StallRepository stallRepository, StallCategoryConfigRepository stallCategoryConfigRepository,
			NumberGenerator numberGenerator) {
		super();
		this.bookingRepository = bookingRepository;
		this.exhibitionRepository = exhibitionRepository;
		this.stallRepository = stallRepository;
		this.stallCategoryConfigRepository = stallCategoryConfigRepository;
		this.numberGenerator = numberGenerator;
	}

	private final BookingRepository bookingRepository;
    private final ExhibitionRepository exhibitionRepository;
    private final StallRepository stallRepository;
    private final StallCategoryConfigRepository stallCategoryConfigRepository;
    private final NumberGenerator numberGenerator;

    private static final double GST_RATE = 0.18;

    @Transactional(readOnly = true)
    public Page<BookingDto> searchBookings(Long exhibitorId, Long exhibitionId,
                                           Booking.BookingStatus status, String search,
                                           Pageable pageable) {
        return bookingRepository.searchBookings(exhibitorId, exhibitionId, status, search, pageable)
            .map(BookingDto::from);
    }

    @Transactional(readOnly = true)
    public BookingDto getById(Long id, User currentUser) {
        Booking booking = findOrThrow(id);
        if (currentUser.getRole() == User.Role.EXHIBITOR
            && !booking.getExhibitor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Access denied to this booking");
        }
        return BookingDto.from(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getUpcomingForExhibitor(Long exhibitorId) {
        return bookingRepository.findUpcomingByExhibitor(exhibitorId, LocalDate.now())
            .stream().map(BookingDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getPastForExhibitor(Long exhibitorId) {
        return bookingRepository.findPastByExhibitor(exhibitorId, LocalDate.now())
            .stream().map(BookingDto::from).toList();
    }

    @Transactional
    public BookingDto create(CreateBookingRequest req, User exhibitor) {
        Exhibition exhibition = exhibitionRepository.findById(req.getExhibitionId())
            .orElseThrow(() -> new ResourceNotFoundException("Exhibition", req.getExhibitionId()));

        if (exhibition.getStatus() == Exhibition.Status.COMPLETED) {
            throw new BadRequestException("Cannot book stalls for a completed exhibition");
        }

        Stall stall = stallRepository.findById(req.getStallId())
            .orElseThrow(() -> new ResourceNotFoundException("Stall", req.getStallId()));

        if (stall.getStatus() != Stall.StallStatus.AVAILABLE) {
            throw new BadRequestException("Stall " + stall.getNumber() + " is not available");
        }

        if (!stall.getExhibition().getId().equals(req.getExhibitionId())) {
            throw new BadRequestException("Stall does not belong to the selected exhibition");
        }

        long days = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        double subtotal = stall.getPrice() * days;
        double gst = subtotal * GST_RATE;
        double total = subtotal + gst;

        Booking.PaymentMethod paymentMethod;
        try {
            paymentMethod = Booking.PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + req.getPaymentMethod());
        }

        Booking booking = new Booking();
        booking.setBookingNumber(numberGenerator.generateBookingNumber());
        booking.setStallCategory(stall.getCategory());
        booking.setExhibitor(exhibitor);
        booking.setExhibition(exhibition);
        booking.setStall(stall);
        booking.setProductCategory(stall.getCategory().name());
        booking.setStallNumber(stall.getNumber());
        booking.setBusinessName(req.getBusinessName());
        booking.setProductCategory(req.getProductCategory());
        booking.setStartDate(req.getStartDate());
        booking.setEndDate(req.getEndDate());
        booking.setDays((int) days);
        booking.setPricePerDay(stall.getPrice());
        booking.setSubtotal(subtotal);
        booking.setGstAmount(gst);
        booking.setGst(gst);
        booking.setTotal(total);
        booking.setSpecialRequirements(req.getSpecialRequirements());
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentStatus(Booking.PaymentStatus.PAID);
        booking.setPaymentMethod(paymentMethod);
            

        // Mark stall as booked
        stall.setStatus(Stall.StallStatus.BOOKED);
        stall.setBookedBy(exhibitor);
        stallRepository.save(stall);

        // Update category booked count
        exhibition.getStallCategories().stream()
            .filter(c -> c.getCategory() == stall.getCategory())
            .findFirst()
            .ifPresent(c -> {
                c.setBooked(c.getBooked() + 1);
                stallCategoryConfigRepository.save(c);
            });

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created: {} for exhibitor {}", saved.getBookingNumber(), exhibitor.getEmail());
        return BookingDto.from(saved);
    }

    @Transactional
    public BookingDto updateStatus(Long id, Booking.BookingStatus newStatus) {
        Booking booking = findOrThrow(id);
        Booking.BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(newStatus);

        // If cancelling, free the stall
        if (newStatus == Booking.BookingStatus.CANCELLED && oldStatus != Booking.BookingStatus.CANCELLED) {
            Stall stall = booking.getStall();
            stall.setStatus(Stall.StallStatus.AVAILABLE);
            stall.setBookedBy(null);
            stallRepository.save(stall);

            // Decrement booked count
            booking.getExhibition().getStallCategories().stream()
                .filter(c -> c.getCategory() == booking.getStallCategory())
                .findFirst()
                .ifPresent(c -> {
                    c.setBooked(Math.max(0, c.getBooked() - 1));
                    stallCategoryConfigRepository.save(c);
                });
        }

        return BookingDto.from(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto cancelByExhibitor(Long id, User exhibitor) {
        Booking booking = findOrThrow(id);
        if (!booking.getExhibitor().getId().equals(exhibitor.getId())) {
            throw new ForbiddenException("Cannot cancel another exhibitor's booking");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if (booking.getEndDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot cancel a past booking");
        }
        return updateStatus(id, Booking.BookingStatus.CANCELLED);
    }

    private Booking findOrThrow(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }
}
