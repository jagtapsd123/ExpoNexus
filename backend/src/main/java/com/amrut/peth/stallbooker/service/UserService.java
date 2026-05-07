package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.ChangePasswordRequest;
import com.amrut.peth.stallbooker.dto.request.UpdateProfileRequest;
import com.amrut.peth.stallbooker.dto.response.UserDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		super();
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
    public Page<UserDto> searchUsers(User.Role role, User.Status status, String search, Pageable pageable) {
        return userRepository.searchUsers(role, status, search, pageable).map(UserDto::from);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        return UserDto.from(findOrThrow(id));
    }

    @Transactional
    public UserDto updateStatus(Long id, User.Status status) {
        User user = findOrThrow(id);
        if (user.getRole() == User.Role.ADMIN) {
            throw new BadRequestException("Cannot change admin status");
        }
        user.setStatus(status);
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto updateProfile(Long id, UpdateProfileRequest req) {
        User user = findOrThrow(id);
        if (req.getName() != null) user.setName(req.getName());
        if (req.getMobile() != null) user.setMobile(req.getMobile());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getBusinessName() != null) user.setBusinessName(req.getBusinessName());
        if (req.getBusinessType() != null) user.setBusinessType(req.getBusinessType());
        if (req.getDesignation() != null) user.setDesignation(req.getDesignation());
        if (req.getDistrict() != null)    user.setDistrict(req.getDistrict());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest req) {
        User user = findOrThrow(id);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserDto updateProfileImageUrl(Long id, String imageUrl) {
        User user = findOrThrow(id);
        user.setProfileImageUrl(imageUrl);
        return UserDto.from(userRepository.save(user));
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
