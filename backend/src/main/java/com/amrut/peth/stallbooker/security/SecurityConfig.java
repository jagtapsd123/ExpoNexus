package com.amrut.peth.stallbooker.security;

import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class SecurityConfig {

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsServiceImpl userDetailsService,
			CorsConfigurationSource corsConfigurationSource) {
		super();
		this.jwtAuthFilter = jwtAuthFilter;
		this.userDetailsService = userDetailsService;
		this.corsConfigurationSource = corsConfigurationSource;
	}

	private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

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
                // Public endpoints
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/**", "/api/auth/refresh").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/landing/**").permitAll()
                // Swagger / Actuator
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                // Admin only
                .requestMatchers("/api/users/**").hasRole("ADMIN")
//               .requestMatchers(HttpMethod.POST, "/api/exhibitions").hasRole("ADMIN")
//                .requestMatchers(HttpMethod.GET, "/api/exhibitions").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/exhibitions/**").hasRole("ADMIN")
                .requestMatchers("/api/stall-layouts/**").hasAnyRole("ADMIN", "ORGANIZER", "EXHIBITOR")
                .requestMatchers(HttpMethod.GET, "/api/stall-layouts/*").hasAnyRole("ADMIN", "ORGANIZER", "EXHIBITOR")
                .requestMatchers("/api/landing/settings").hasRole("ADMIN")
                .requestMatchers("/api/landing/gallery").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasAuthority("ADMIN")
                .requestMatchers("/api/users/**").hasAuthority("ADMIN")
                
                
                // Admin + Organizer
                .requestMatchers(HttpMethod.POST, "/api/exhibitions").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.GET, "/api/exhibitions").hasAnyRole("ADMIN", "ORGANIZER", "EXHIBITOR") // later rule
                .requestMatchers("/api/exhibitions/**").hasAnyRole("ADMIN", "ORGANIZER", "EXHIBITOR") // later rule
                .requestMatchers(HttpMethod.GET, "/api/bookings").hasAnyRole("ADMIN", "ORGANIZER", "EXHIBITOR")

               .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/status").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.PATCH, "/api/facilities/*/fulfill").hasAnyRole("ADMIN", "ORGANIZER")
                .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/status").hasAnyRole("ADMIN", "ORGANIZER")
                // Everything else requires authentication
                .requestMatchers("/api/bookings").hasRole("EXHIBITOR")
                .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("EXHIBITOR")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
