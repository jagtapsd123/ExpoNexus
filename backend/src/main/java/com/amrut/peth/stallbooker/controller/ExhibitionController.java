package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateExhibitionRequest;
import com.amrut.peth.stallbooker.dto.request.UpdateExhibitionRequest;
import com.amrut.peth.stallbooker.dto.response.ExhibitionDto;
import com.amrut.peth.stallbooker.entity.Exhibition;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.ForbiddenException;
import com.amrut.peth.stallbooker.service.ExhibitionService;
import com.amrut.peth.stallbooker.service.FileStorageService;
import com.amrut.peth.stallbooker.util.SecurityUtils;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/exhibitions")
@Tag(name = "Exhibitions", description = "Exhibition management")
public class ExhibitionController {

    private final ExhibitionService exhibitionService;
    private final FileStorageService fileStorageService;
    private final SecurityUtils securityUtils;

    public ExhibitionController(ExhibitionService exhibitionService,
                                FileStorageService fileStorageService,
                                SecurityUtils securityUtils) {
        this.exhibitionService = exhibitionService;
        this.fileStorageService = fileStorageService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    @Operation(summary = "List exhibitions with optional status filter and search")
    public ResponseEntity<ApiResponse<Page<ExhibitionDto>>> list(
        @RequestParam(required = false) Exhibition.Status status,
        @RequestParam(required = false) String search,
        Pageable pageable) {

        // Organizers only see exhibitions in their own district
        String districtFilter = securityUtils.getCurrentUserOptional()
            .filter(u -> u.getRole() == User.Role.ORGANIZER)
            .map(User::getDistrict)
            .orElse(null);

        return ResponseEntity.ok(ApiResponse.success(
            exhibitionService.searchExhibitions(status, search, districtFilter, pageable)));
    }

	@GetMapping("/{id}")
    @Operation(summary = "Get exhibition by ID")
    public ResponseEntity<ApiResponse<ExhibitionDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(exhibitionService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new exhibition")
    public ResponseEntity<ApiResponse<ExhibitionDto>> create(@Valid @RequestBody CreateExhibitionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Exhibition created", exhibitionService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Update exhibition details")
    public ResponseEntity<ApiResponse<ExhibitionDto>> update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateExhibitionRequest req) {
        ensureOrganizerCanManage(id);
        return ResponseEntity.ok(ApiResponse.success("Exhibition updated", exhibitionService.update(id, req)));
    }

    @PatchMapping("/{id}/revenue-visibility")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle revenue visibility for exhibitors")
    public ResponseEntity<ApiResponse<ExhibitionDto>> toggleRevenue(
        @PathVariable Long id,
        @RequestParam boolean visible) {
        return ResponseEntity.ok(ApiResponse.success(exhibitionService.toggleRevenueVisibility(id, visible)));
    }

    @PutMapping("/{id}/organizers")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Assign organizers to an exhibition")
    public ResponseEntity<ApiResponse<ExhibitionDto>> assignOrganizers(
        @PathVariable Long id,
        @RequestBody List<Long> organizerIds) {
        return ResponseEntity.ok(ApiResponse.success("Organizers assigned",
            exhibitionService.assignOrganizers(id, organizerIds)));
    }

    @PostMapping("/{id}/layout-image")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Upload or replace exhibition layout image")
    public ResponseEntity<ApiResponse<String>> uploadLayoutImage(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.uploadFile(file, "layouts/" + id);
        return ResponseEntity.ok(ApiResponse.success("Layout image uploaded", url));
    }

    @PostMapping("/{id}/banner-image")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Upload or replace exhibition banner image")
    public ResponseEntity<ApiResponse<ExhibitionDto>> uploadBannerImage(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.uploadFile(file, "banners/" + id);
        return ResponseEntity.ok(ApiResponse.success("Banner uploaded", exhibitionService.setBannerImage(id, url)));
    }

    @PatchMapping("/{id}/organizer-name")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Set organizer / contact name shown to exhibitors")
    public ResponseEntity<ApiResponse<ExhibitionDto>> setOrganizerName(
        @PathVariable Long id,
        @RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success("Organizer name updated", exhibitionService.setOrganizerName(id, name)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER')")
    @Operation(summary = "Delete an exhibition")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        ensureOrganizerCanManage(id);
        exhibitionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Exhibition deleted"));
    }

    private void ensureOrganizerCanManage(Long exhibitionId) {
        securityUtils.getCurrentUserOptional()
            .filter(user -> user.getRole() == User.Role.ORGANIZER)
            .ifPresent(user -> {
                ExhibitionDto exhibition = exhibitionService.getById(exhibitionId);
                String userDistrict = user.getDistrict();
                String exhibitionDistrict = exhibition.getDistrict();
                if (userDistrict == null || exhibitionDistrict == null ||
                    !userDistrict.equalsIgnoreCase(exhibitionDistrict)) {
                    throw new ForbiddenException("You can manage only exhibitions in your district");
                }
            });
    }
}
