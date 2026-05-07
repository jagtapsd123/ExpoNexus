package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

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

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public RoleRequest getRole() {
		return role;
	}

	public void setRole(RoleRequest role) {
		this.role = role;
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

	public String getDistrict() {
		return district;
	}

	public void setDistrict(String district) {
		this.district = district;
	}

	@NotBlank(message = "Name is required")
    @Size(min = 2, max = 150, message = "Name must be 2-150 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Mobile is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String mobile;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address too long")
    private String address;

    @NotNull(message = "Role is required")
    private RoleRequest role;

    // Exhibitor fields
    @Size(max = 200, message = "Business name too long")
    private String businessName;

    @Size(max = 100, message = "Business type too long")
    private String businessType;

    // Organizer fields
    @Size(max = 100, message = "Designation too long")
    private String designation;

    @Size(max = 100, message = "District too long")
    private String district;

    public enum RoleRequest {
        ORGANIZER, EXHIBITOR
    }
}
