package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.response.AdminExhibitionSummaryDto;
import com.amrut.peth.stallbooker.dto.response.DashboardStatsDto;
import com.amrut.peth.stallbooker.dto.response.ExhibitionReportDto;
import com.amrut.peth.stallbooker.dto.response.ExhibitorDashboardDto;
import com.amrut.peth.stallbooker.dto.response.MonthlySalesDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.DashboardService;
import com.amrut.peth.stallbooker.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtils securityUtils;

    public DashboardController(DashboardService dashboardService, SecurityUtils securityUtils) {
        this.dashboardService = dashboardService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Get aggregate platform statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats()));
    }

    @GetMapping("/exhibitor-stats")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Get dashboard statistics for the current exhibitor")
    public ResponseEntity<ApiResponse<ExhibitorDashboardDto>> getExhibitorStats() {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getExhibitorStats(current.getId())));
    }

    @GetMapping("/exhibitor-stats/exhibition-reports")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Get per-exhibition profit/loss reports for the current exhibitor")
    public ResponseEntity<ApiResponse<List<ExhibitionReportDto>>> getExhibitionReports() {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getExhibitionReports(current.getId())));
    }

    @GetMapping("/exhibitor-stats/monthly-sales")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Get monthly sales data for charts")
    public ResponseEntity<ApiResponse<List<MonthlySalesDto>>> getMonthlySales() {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMonthlySales(current.getId())));
    }

    @GetMapping("/exhibition-summary")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Get exhibition-wise booking and revenue summary for admin")
    public ResponseEntity<ApiResponse<List<AdminExhibitionSummaryDto>>> getExhibitionSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminExhibitionSummary()));
    }
}
