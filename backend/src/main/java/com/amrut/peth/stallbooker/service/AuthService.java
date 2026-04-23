package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.LoginRequest;
import com.amrut.peth.stallbooker.dto.request.RefreshTokenRequest;
import com.amrut.peth.stallbooker.dto.request.RegisterRequest;
import com.amrut.peth.stallbooker.dto.response.AuthResponse;
import com.amrut.peth.stallbooker.dto.response.UserDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.UserRepository;
import com.amrut.peth.stallbooker.security.JwtUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final IdSequenceService idSequenceService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager, IdSequenceService idSequenceService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.idSequenceService = idSequenceService;
    }

	
    @Value("${app.security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.security.lock-duration-minutes:30}")
    private int lockDurationMinutes;

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isAccountNonLocked()) {
            throw new org.springframework.security.authentication.LockedException(
                "Account locked until " + user.getLockedUntil());
        }
        if (user.getStatus() == User.Status.PENDING) {
            throw new org.springframework.security.authentication.DisabledException(
                "Your account is pending admin approval");
        }
        if (user.getStatus() == User.Status.REJECTED) {
            throw new org.springframework.security.authentication.DisabledException(
                "Your account has been rejected");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            handleFailedLogin(user);
            throw e;
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        String accessToken = jwtUtil.generateAccessToken(
            user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        user.setRefreshToken(passwordEncoder.encode(refreshToken));
        user.setRefreshTokenExpiry(LocalDateTime.now()
            .plusSeconds(jwtUtil.getRefreshTokenExpirationMs() / 1000));
        userRepository.save(user);

        return buildAuthResponse(accessToken, refreshToken, user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User.Role role = req.getRole() == RegisterRequest.RoleRequest.ORGANIZER
            ? User.Role.ORGANIZER : User.Role.EXHIBITOR;

        User user = new User();
        user.setMemberId(idSequenceService.nextMemberId());
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setMobile(req.getMobile());
        user.setAddress(req.getAddress());
        user.setRole(role);
        user.setStatus(User.Status.PENDING);
        user.setBusinessName(req.getBusinessName());
        user.setBusinessType(req.getBusinessType());
        user.setDesignation(req.getDesignation());

        userRepository.save(user);
        log.info("New user registered: {} ({})", user.getEmail(), user.getRole());

        AuthResponse response = new AuthResponse();
        response.setUser(UserDto.from(user));
        return response;
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest req) {
        if (!jwtUtil.validateToken(req.getRefreshToken())) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String email = jwtUtil.extractEmail(req.getRefreshToken());
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRefreshTokenExpiry() == null ||
            user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token expired");
        }

        String newAccessToken = jwtUtil.generateAccessToken(
            user.getEmail(), user.getRole().name(), user.getId());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        user.setRefreshToken(passwordEncoder.encode(newRefreshToken));
        user.setRefreshTokenExpiry(LocalDateTime.now()
            .plusSeconds(jwtUtil.getRefreshTokenExpirationMs() / 1000));
        userRepository.save(user);

        return buildAuthResponse(newAccessToken, newRefreshToken, user);
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        });
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtUtil.getAccessTokenExpirationMs() / 1000);
        response.setUser(UserDto.from(user));
        return response;
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= maxFailedAttempts) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(lockDurationMinutes));
            log.warn("Account locked for user: {}", user.getEmail());
        }
        userRepository.save(user);
    }
}
