package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;

import com.amrut.peth.stallbooker.dto.request.UpdateLandingSettingsRequest;
import com.amrut.peth.stallbooker.dto.response.LandingSettingsDto;
import com.amrut.peth.stallbooker.entity.GalleryImage;
import com.amrut.peth.stallbooker.service.FileStorageService;
import com.amrut.peth.stallbooker.service.LandingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/landing")
@RequiredArgsConstructor
@Tag(name = "Landing", description = "Public landing page content and admin management")
public class LandingController {

    private final LandingService landingService;
    private final FileStorageService fileStorageService;

    @GetMapping("/settings")
    @Operation(summary = "Get landing page settings (public)")
    public ResponseEntity<ApiResponse<LandingSettingsDto>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(landingService.getSettings()));
    }

    public LandingController(LandingService landingService, FileStorageService fileStorageService) {
		super();
		this.landingService = landingService;
		this.fileStorageService = fileStorageService;
	}

	@PutMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update landing page settings")
    public ResponseEntity<ApiResponse<LandingSettingsDto>> updateSettings(
            @Valid @RequestBody UpdateLandingSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated", landingService.updateSettings(req)));
    }

    @PostMapping(value = "/hero-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload hero background image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadHeroImage(
            @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.uploadFile(file, "landing/hero");
        UpdateLandingSettingsRequest req = new UpdateLandingSettingsRequest();
        req.setHeroBackgroundUrl(url);
        landingService.updateSettings(req);
        return ResponseEntity.ok(ApiResponse.success("Hero image uploaded", Map.of("url", url)));
    }

    @GetMapping("/gallery")
    @Operation(summary = "Get landing gallery images with IDs (public)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGallery() {
        return ResponseEntity.ok(ApiResponse.success(landingService.getGalleryItems()));
    }

    @PostMapping(value = "/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload a landing gallery image")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addGalleryImage(
            @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.uploadFile(file, "landing/gallery");
        GalleryImage image = landingService.addGalleryImage(url);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gallery image added",
                        Map.of("id", image.getId(), "url", image.getImageUrl())));
    }

    @DeleteMapping("/gallery/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a landing gallery image")
    public ResponseEntity<ApiResponse<Void>> deleteGalleryImage(@PathVariable Long id) {
        landingService.deleteGalleryImage(id);
        return ResponseEntity.ok(ApiResponse.success("Gallery image deleted"));
    }
}
