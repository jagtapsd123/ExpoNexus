package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateStallRequest;
import com.amrut.peth.stallbooker.dto.response.StallDto;
import com.amrut.peth.stallbooker.entity.Stall;
import com.amrut.peth.stallbooker.service.StallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stalls")
@RequiredArgsConstructor
@Tag(name = "Stalls", description = "Stall inventory management")
public class StallController {

    private final StallService stallService;

    public StallController(StallService stallService) {
		super();
		this.stallService = stallService;
	}

	@GetMapping
    @Operation(summary = "List stalls for an exhibition")
    public ResponseEntity<ApiResponse<List<StallDto>>> listByExhibition(
        @RequestParam Long exhibitionId) {
        return ResponseEntity.ok(ApiResponse.success(stallService.getByExhibition(exhibitionId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stall by ID")
    public ResponseEntity<ApiResponse<StallDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(stallService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new stall")
    public ResponseEntity<ApiResponse<StallDto>> create(@Valid @RequestBody CreateStallRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Stall created", stallService.create(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Update stall status")
    public ResponseEntity<ApiResponse<StallDto>> updateStatus(
        @PathVariable Long id,
        @RequestParam Stall.StallStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", stallService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a stall")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        stallService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Stall deleted"));
    }
}
