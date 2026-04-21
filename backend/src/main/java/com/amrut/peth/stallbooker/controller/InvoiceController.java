package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.response.InvoiceDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.InvoiceService;
import com.amrut.peth.stallbooker.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice management and PDF generation")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final SecurityUtils securityUtils;

    public InvoiceController(InvoiceService invoiceService, SecurityUtils securityUtils) {
		super();
		this.invoiceService = invoiceService;
		this.securityUtils = securityUtils;
	}

	@GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "List all invoices")
    public ResponseEntity<ApiResponse<Page<InvoiceDto>>> listAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getAllInvoices(pageable)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current exhibitor's invoices")
    public ResponseEntity<ApiResponse<Page<InvoiceDto>>> myInvoices(Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getForExhibitor(current.getId(), pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<ApiResponse<InvoiceDto>> get(@PathVariable Long id) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getById(id, current)));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get invoice by booking ID")
    public ResponseEntity<ApiResponse<InvoiceDto>> getByBooking(@PathVariable Long bookingId) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(invoiceService.getByBookingId(bookingId, current)));
    }

    @PostMapping("/generate/{bookingId}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Generate invoice for a booking")
    public ResponseEntity<ApiResponse<InvoiceDto>> generate(@PathVariable Long bookingId) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Invoice generated", invoiceService.generateForBooking(bookingId)));
    }
}
