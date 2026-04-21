package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBookingRequest {

    public Long getExhibitionId() {
		return exhibitionId;
	}

	public void setExhibitionId(Long exhibitionId) {
		this.exhibitionId = exhibitionId;
	}

	public Long getStallId() {
		return stallId;
	}

	public void setStallId(Long stallId) {
		this.stallId = stallId;
	}

	public String getBusinessName() {
		return businessName;
	}

	public void setBusinessName(String businessName) {
		this.businessName = businessName;
	}

	public String getProductCategory() {
		return productCategory;
	}

	public void setProductCategory(String productCategory) {
		this.productCategory = productCategory;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public String getSpecialRequirements() {
		return specialRequirements;
	}

	public void setSpecialRequirements(String specialRequirements) {
		this.specialRequirements = specialRequirements;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	@NotNull(message = "Exhibition ID is required")
    private Long exhibitionId;

    @NotNull(message = "Stall ID is required")
    private Long stallId;

    @NotBlank(message = "Business name is required")
    @Size(max = 200)
    private String businessName;

    @NotBlank(message = "Product category is required")
    @Size(max = 100)
    private String productCategory;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Size(max = 1000)
    private String specialRequirements;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @AssertTrue(message = "End date must be on or after start date")
    public boolean isEndDateValid() {
        if (startDate == null || endDate == null) return true;
        return !endDate.isBefore(startDate);
    }
}
