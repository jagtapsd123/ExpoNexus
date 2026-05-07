package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email",     columnList = "email",     unique = true),
    @Index(name = "idx_users_member_id", columnList = "member_id", unique = true),
    @Index(name = "idx_users_role",      columnList = "role"),
    @Index(name = "idx_users_status",    columnList = "status")
})

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /** Auto-generated on registration. Format: MEM0001, MEM0002 … Never changes after creation. */
    @Column(name = "member_id", unique = true, nullable = false, length = 10)
    private String memberId;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "phone", nullable = false, length = 20)
    private String mobile;

    @Column(length = 500)
    private String address;

    @Column(name = "business_name", length = 200)
    private String businessName;

    @Column(name = "business_type", length = 100)
    private String businessType;

    @Column(length = 100)
    private String designation;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(length = 100)
    private String district;

    @Column(name = "refresh_token", length = 500)
    private String refreshToken;

    @Column(name = "refresh_token_expiry")
    private LocalDateTime refreshTokenExpiry;

    @Column(name = "failed_login_attempts")
    @Builder.Default
    private int failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    public enum Role {
        ADMIN, ORGANIZER, EXHIBITOR
    }

    public enum Status {
        PENDING, APPROVED, REJECTED
    }

    @OneToMany(mappedBy = "exhibitor", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Booking> bookings = new HashSet<>();

    @ManyToMany(mappedBy = "assignedOrganizers", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Exhibition> assignedExhibitions = new HashSet<>();

    public boolean isAccountNonLocked() {
        if (lockedUntil == null) return true;
        return LocalDateTime.now().isAfter(lockedUntil);
    }
    
    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMemberId() {
		return memberId;
	}

	public void setMemberId(String memberId) {
		this.memberId = memberId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getBusinessName() {
		return businessName;
	}

	public void setBusinessName(String businessName) {
		this.businessName = businessName;
	}

	public String getBusinessType() {
		return businessType;
	}

	public void setBusinessType(String businessType) {
		this.businessType = businessType;
	}

	public String getDesignation() {
		return designation;
	}

	public void setDesignation(String designation) {
		this.designation = designation;
	}

	public String getProfileImageUrl() {
		return profileImageUrl;
	}

	public void setProfileImageUrl(String profileImageUrl) {
		this.profileImageUrl = profileImageUrl;
	}

	public String getDistrict() {
		return district;
	}

	public void setDistrict(String district) {
		this.district = district;
	}

	public String getRefreshToken() {
		return refreshToken;
	}

	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	public LocalDateTime getRefreshTokenExpiry() {
		return refreshTokenExpiry;
	}

	public void setRefreshTokenExpiry(LocalDateTime refreshTokenExpiry) {
		this.refreshTokenExpiry = refreshTokenExpiry;
	}

	public int getFailedLoginAttempts() {
		return failedLoginAttempts;
	}

	public void setFailedLoginAttempts(int failedLoginAttempts) {
		this.failedLoginAttempts = failedLoginAttempts;
	}

	public LocalDateTime getLockedUntil() {
		return lockedUntil;
	}

	public void setLockedUntil(LocalDateTime lockedUntil) {
		this.lockedUntil = lockedUntil;
	}

	public Set<Booking> getBookings() {
		return bookings;
	}

	public void setBookings(Set<Booking> bookings) {
		this.bookings = bookings;
	}

	public Set<Exhibition> getAssignedExhibitions() {
		return assignedExhibitions;
	}

	public void setAssignedExhibitions(Set<Exhibition> assignedExhibitions) {
		this.assignedExhibitions = assignedExhibitions;
	}
}
