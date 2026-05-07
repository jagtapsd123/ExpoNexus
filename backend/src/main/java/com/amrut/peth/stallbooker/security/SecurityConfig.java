package com.amrut.peth.stallbooker.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          UserDetailsServiceImpl userDetailsService,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter         = jwtAuthFilter;
        this.userDetailsService    = userDetailsService;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ── CORS preflight ────────────────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Fully public ─────────────────────────────────────────────────
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/landing/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/exhibitions", "/api/exhibitions/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/beneficiaries").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/districts").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                // ── Admin only ───────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/beneficiaries/import").hasRole("ADMIN")
                .requestMatchers("/api/beneficiaries/import").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/exhibitions/**").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/landing/settings", "/api/landing/gallery",
                                 "/api/landing/hero-image").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/landing/settings", "/api/landing/gallery",
                        "/api/landing/hero-image").hasRole("ADMIN")


                // ── Admin + Organizer ────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/exhibitions/**").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.PUT,   "/api/exhibitions/**").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.PATCH,  "/api/exhibitions/**").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/status").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.PATCH, "/api/facilities/*/fulfill").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/status").hasAnyRole("ADMIN", "ORGANIZER")

                // ── Stall layouts — all authenticated roles ──────────────────────
                .requestMatchers("/api/stall-layouts/**").hasAnyRole("ADMIN", "ORGANIZER", "EXHIBITOR")

                // ── Everything else requires authentication ──────────────────────
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
