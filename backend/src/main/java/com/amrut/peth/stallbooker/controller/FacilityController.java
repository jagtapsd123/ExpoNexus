package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateFacilityRequest;
import com.amrut.peth.stallbooker.dto.response.FacilityRequestDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.FacilityService;
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
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@Tag(name = "Facilities", description = "Stall facility requests")
public class FacilityController {

    private final FacilityService facilityService;
    private final SecurityUtils securityUtils;

    public FacilityController(FacilityService facilityService, SecurityUtils securityUtils) {
		super();
		this.facilityService = facilityService;
		this.securityUtils = securityUtils;
	}

	@GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "List all facility requests")
    public ResponseEntity<ApiResponse<Page<FacilityRequestDto>>> listAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(facilityService.getAll(pageable)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Get current exhibitor's facility requests")
    public ResponseEntity<ApiResponse<Page<FacilityRequestDto>>> myRequests(Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(facilityService.getForExhibitor(current.getId(), pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Submit a facility request")
    public ResponseEntity<ApiResponse<FacilityRequestDto>> create(@Valid @RequestBody CreateFacilityRequest req) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Facility request submitted", facilityService.create(req, current)));
    }

    @PatchMapping("/{id}/fulfill")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Mark facility request as fulfilled")
    public ResponseEntity<ApiResponse<FacilityRequestDto>> fulfill(
        @PathVariable Long id,
        @RequestParam(required = false) String note) {
        return ResponseEntity.ok(ApiResponse.success("Request fulfilled", facilityService.fulfill(id, note)));
    }
}
