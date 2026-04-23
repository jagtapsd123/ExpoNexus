package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateFacilityTypeRequest;
import com.amrut.peth.stallbooker.dto.response.FacilityTypeDto;
import com.amrut.peth.stallbooker.service.FacilityTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facility-types")
@Tag(name = "Facility Types", description = "Facility master list and stall assignments")
public class FacilityTypeController {

    private final FacilityTypeService facilityTypeService;

    public FacilityTypeController(FacilityTypeService facilityTypeService) {
        this.facilityTypeService = facilityTypeService;
    }

    @GetMapping
    @Operation(summary = "List all facility types")
    public ResponseEntity<ApiResponse<List<FacilityTypeDto>>> list() {
        return ResponseEntity.ok(ApiResponse.success(facilityTypeService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "List active facility types (for exhibitors)")
    public ResponseEntity<ApiResponse<List<FacilityTypeDto>>> listActive() {
        return ResponseEntity.ok(ApiResponse.success(facilityTypeService.getActive()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Create a facility type")
    public ResponseEntity<ApiResponse<FacilityTypeDto>> create(@Valid @RequestBody CreateFacilityTypeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Facility type created", facilityTypeService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Update a facility type")
    public ResponseEntity<ApiResponse<FacilityTypeDto>> update(
        @PathVariable Long id,
        @Valid @RequestBody CreateFacilityTypeRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Facility type updated", facilityTypeService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Delete a facility type")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        facilityTypeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Facility type deleted"));
    }

    @PutMapping("/stall/{stallId}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Assign facilities to a stall (replaces existing assignment)")
    public ResponseEntity<ApiResponse<List<FacilityTypeDto>>> assignToStall(
        @PathVariable Long stallId,
        @RequestBody List<Long> facilityIds) {
        return ResponseEntity.ok(ApiResponse.success(
            "Facilities assigned", facilityTypeService.assignToStall(stallId, facilityIds)));
    }

    @GetMapping("/stall/{stallId}")
    @Operation(summary = "Get facilities assigned to a stall")
    public ResponseEntity<ApiResponse<List<FacilityTypeDto>>> getForStall(@PathVariable Long stallId) {
        return ResponseEntity.ok(ApiResponse.success(facilityTypeService.getForStall(stallId)));
    }
}
