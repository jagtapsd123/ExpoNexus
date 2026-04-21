package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.ChangePasswordRequest;
import com.amrut.peth.stallbooker.dto.request.UpdateProfileRequest;
import com.amrut.peth.stallbooker.dto.response.UserDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.FileStorageService;
import com.amrut.peth.stallbooker.service.UserService;
import com.amrut.peth.stallbooker.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management (admin only)")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final SecurityUtils securityUtils;

    public UserController(UserService userService, FileStorageService fileStorageService, SecurityUtils securityUtils) {
		super();
		this.userService = userService;
		this.fileStorageService = fileStorageService;
		this.securityUtils = securityUtils;
	}

	@GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users with optional filters")
    public ResponseEntity<ApiResponse<Page<UserDto>>> listUsers(
        @RequestParam(required = false) User.Role role,
        @RequestParam(required = false) User.Status status,
        @RequestParam(required = false) String search,
        Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.searchUsers(role, status, search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.success(UserDto.from(securityUtils.getCurrentUser())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user approval status")
    public ResponseEntity<ApiResponse<UserDto>> updateStatus(
        @PathVariable Long id,
        @RequestParam User.Status status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", userService.updateStatus(id, status)));
    }

    @PutMapping("/{id}/profile")
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
        @PathVariable Long id,
        @Valid @RequestBody UpdateProfileRequest req) {
        User current = securityUtils.getCurrentUser();
        // Only the user themselves or admin can update profile
        if (!current.getId().equals(id) && current.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(id, req)));
    }

    @PutMapping("/{id}/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
        @PathVariable Long id,
        @Valid @RequestBody ChangePasswordRequest req) {
        User current = securityUtils.getCurrentUser();
        if (!current.getId().equals(id)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        userService.changePassword(id, req);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @PostMapping("/{id}/profile-image")
    @Operation(summary = "Upload profile image")
    public ResponseEntity<ApiResponse<UserDto>> uploadProfileImage(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file) {
        User current = securityUtils.getCurrentUser();
        if (!current.getId().equals(id) && current.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        String imageUrl = fileStorageService.uploadFile(file, "profiles");
        return ResponseEntity.ok(ApiResponse.success("Profile image updated",
            userService.updateProfileImageUrl(id, imageUrl)));
    }
}
