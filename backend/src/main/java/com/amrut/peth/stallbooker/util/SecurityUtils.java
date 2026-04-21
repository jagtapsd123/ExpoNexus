package com.amrut.peth.stallbooker.util;

import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
		super();
		this.userRepository = userRepository;
	}

	public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_" + role.toUpperCase()));
    }

    public static boolean isAdmin() { return hasRole("ADMIN"); }
    public static boolean isOrganizer() { return hasRole("ORGANIZER"); }
    public static boolean isExhibitor() { return hasRole("EXHIBITOR"); }
}
