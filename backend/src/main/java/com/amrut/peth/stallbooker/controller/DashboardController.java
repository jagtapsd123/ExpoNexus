package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.response.DashboardStatsDto;
import com.amrut.peth.stallbooker.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Admin and organizer dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
		super();
		this.dashboardService = dashboardService;
	}

	@GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Get aggregate platform statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats()));
    }
}
