package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateComplaintRequest;
import com.amrut.peth.stallbooker.dto.response.ComplaintDto;
import com.amrut.peth.stallbooker.entity.Complaint;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.ComplaintService;
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

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Exhibitor complaints and feedback")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "List all complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintDto>>> listAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.getAll(pageable)));
    }

    public ComplaintController(ComplaintService complaintService, SecurityUtils securityUtils) {
		super();
		this.complaintService = complaintService;
		this.securityUtils = securityUtils;
	}

	@GetMapping("/my")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Get current exhibitor's complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintDto>>> myComplaints(Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(complaintService.getForExhibitor(current.getId(), pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Submit a complaint")
    public ResponseEntity<ApiResponse<ComplaintDto>> create(@Valid @RequestBody CreateComplaintRequest req) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Complaint submitted", complaintService.create(req, current)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Update complaint status")
    public ResponseEntity<ApiResponse<ComplaintDto>> updateStatus(
        @PathVariable Long id,
        @RequestParam Complaint.ComplaintStatus status,
        @RequestParam(required = false) String resolutionNote) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
            complaintService.updateStatus(id, status, resolutionNote)));
    }
}
