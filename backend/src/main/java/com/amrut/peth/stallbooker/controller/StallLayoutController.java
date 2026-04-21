package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.SaveLayoutRequest;
import com.amrut.peth.stallbooker.dto.response.StallLayoutDto;
import com.amrut.peth.stallbooker.service.StallLayoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stall-layouts")
@RequiredArgsConstructor
@Tag(name = "Stall Layouts", description = "Visual hall layout configuration per exhibition")
public class StallLayoutController {

    public StallLayoutController(StallLayoutService stallLayoutService) {
		super();
		this.stallLayoutService = stallLayoutService;
	}

	private final StallLayoutService stallLayoutService;

    @GetMapping("/{exhibitionId}")
    @Operation(summary = "Get stall layout for an exhibition")
    public ResponseEntity<ApiResponse<StallLayoutDto>> get(@PathVariable("exhibitionId") Long exhibitionId) {
        return ResponseEntity.ok(ApiResponse.success(stallLayoutService.getByExhibition(exhibitionId)));
    }

    @PutMapping("/{exhibitionId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Save/update stall layout for an exhibition")
    public ResponseEntity<ApiResponse<StallLayoutDto>> save(
        @PathVariable Long exhibitionId,
        @Valid @RequestBody SaveLayoutRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Layout saved",
            stallLayoutService.save(exhibitionId, req)));
    }

    @DeleteMapping("/{exhibitionId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete stall layout for an exhibition")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long exhibitionId) {
        stallLayoutService.delete(exhibitionId);
        return ResponseEntity.ok(ApiResponse.success("Layout deleted"));
    }
}
