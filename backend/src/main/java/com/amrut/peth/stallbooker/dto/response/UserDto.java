package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.User;

import java.time.LocalDateTime;

public class UserDto {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String mobile;
    private String address;
    private String businessName;
    private String businessType;
    private String designation;
    private String profileImageUrl;
    private LocalDateTime createdAt;

    public UserDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static UserDto from(User u) {
        UserDto dto = new UserDto();
        dto.id = u.getId();
        dto.name = u.getName();
        dto.email = u.getEmail();
        dto.role = u.getRole().name().toLowerCase();
        dto.status = u.getStatus().name().toLowerCase();
        dto.mobile = u.getMobile();
        dto.address = u.getAddress();
        dto.businessName = u.getBusinessName();
        dto.businessType = u.getBusinessType();
        dto.designation = u.getDesignation();
        dto.profileImageUrl = u.getProfileImageUrl();
        dto.createdAt = u.getCreatedAt();
        return dto;
    }
}
