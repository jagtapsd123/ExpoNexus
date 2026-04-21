package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateBookingRequest;
import com.amrut.peth.stallbooker.dto.response.BookingDto;
import com.amrut.peth.stallbooker.entity.Booking;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.BookingService;
import com.amrut.peth.stallbooker.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
//@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Stall booking management")
public class BookingController {

    private final BookingService bookingService;
    private final SecurityUtils securityUtils;

    public BookingController(BookingService bookingService, SecurityUtils securityUtils) {
		super();
		this.bookingService = bookingService;
		this.securityUtils = securityUtils;
	}

	@GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER','EXHIBITOR')")
    @Operation(summary = "List all bookings (admin/organizer)")
    public ResponseEntity<ApiResponse<Page<BookingDto>>> listAll(
        @RequestParam(required = false) Long exhibitorId,
        @RequestParam(required = false) Long exhibitionId,
        @RequestParam(required = false) Booking.BookingStatus status,
        @RequestParam(required = false) String search,
        Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.searchBookings(exhibitorId, exhibitionId, status, search, pageable)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Get current exhibitor's bookings")
    public ResponseEntity<ApiResponse<Page<BookingDto>>> myBookings(
        @RequestParam(required = false) Long exhibitionId,
        @RequestParam(required = false) Booking.BookingStatus status,
        @RequestParam(required = false) String search,
        Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.searchBookings(current.getId(), exhibitionId, status, search, pageable)));
    }

    @GetMapping("/my/upcoming")
    @Operation(summary = "Get current exhibitor's upcoming bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> myUpcoming() {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(bookingService.getUpcomingForExhibitor(current.getId())));
    }

    @GetMapping("/my/past")
    @Operation(summary = "Get current exhibitor's past bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> myPast() {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(bookingService.getPastForExhibitor(current.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingDto>> get(@PathVariable Long id) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(bookingService.getById(id, current)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Create a new stall booking")
    public ResponseEntity<ApiResponse<BookingDto>> create(@Valid @RequestBody CreateBookingRequest req) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Booking confirmed", bookingService.create(req, current)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Update booking status (admin/organizer)")
    public ResponseEntity<ApiResponse<BookingDto>> updateStatus(
        @PathVariable Long id,
        @RequestParam Booking.BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", bookingService.updateStatus(id, status)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Cancel booking (exhibitor)")
    public ResponseEntity<ApiResponse<BookingDto>> cancel(@PathVariable Long id) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled",
            bookingService.cancelByExhibitor(id, current)));
    }
}
