package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.LoginRequest;
import com.amrut.peth.stallbooker.dto.request.RefreshTokenRequest;
import com.amrut.peth.stallbooker.dto.request.RegisterRequest;
import com.amrut.peth.stallbooker.dto.response.AuthResponse;
import com.amrut.peth.stallbooker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, register, refresh tokens")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
		super();
		this.authService = authService;
	}

	@PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(req)));
    }

    @PostMapping("/register")
    @Operation(summary = "Register as exhibitor or organizer")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse response = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Registration submitted. Awaiting admin approval.", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authService.refreshToken(req)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            authService.logout(userDetails.getUsername());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
