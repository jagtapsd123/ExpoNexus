package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateStallCategoryTypeRequest;
import com.amrut.peth.stallbooker.dto.response.StallCategoryTypeDto;
import com.amrut.peth.stallbooker.service.StallCategoryTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stall-category-types")
@Tag(name = "Stall Category Types", description = "Admin-managed stall category masters and facility mapping")
public class StallCategoryTypeController {

    private final StallCategoryTypeService stallCategoryTypeService;

    public StallCategoryTypeController(StallCategoryTypeService stallCategoryTypeService) {
        this.stallCategoryTypeService = stallCategoryTypeService;
    }

    @GetMapping
    @Operation(summary = "List all stall category types")
    public ResponseEntity<ApiResponse<List<StallCategoryTypeDto>>> list() {
        return ResponseEntity.ok(ApiResponse.success(stallCategoryTypeService.getAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a stall category type")
    public ResponseEntity<ApiResponse<StallCategoryTypeDto>> create(@Valid @RequestBody CreateStallCategoryTypeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Stall category created", stallCategoryTypeService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a stall category type")
    public ResponseEntity<ApiResponse<StallCategoryTypeDto>> update(
        @PathVariable Long id,
        @Valid @RequestBody CreateStallCategoryTypeRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success("Stall category updated", stallCategoryTypeService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a stall category type")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        stallCategoryTypeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Stall category deleted"));
    }

    @PutMapping("/{id}/facilities")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign facilities to a stall category type")
    public ResponseEntity<ApiResponse<StallCategoryTypeDto>> assignFacilities(
        @PathVariable Long id,
        @RequestBody List<Long> facilityIds
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            "Facilities assigned to stall category",
            stallCategoryTypeService.assignFacilities(id, facilityIds)
        ));
    }
}
