package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateStallRequest {

    public Long getExhibitionId() {
		return exhibitionId;
	}

	public void setExhibitionId(Long exhibitionId) {
		this.exhibitionId = exhibitionId;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	@NotNull(message = "Exhibition ID is required")
    private Long exhibitionId;

    @NotBlank(message = "Stall number is required")
    @Size(max = 20)
    private String number;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "PRIME|SUPER|GENERAL|prime|super|general", message = "Category must be PRIME, SUPER, or GENERAL")
    private String category;

    @Min(0)
    private double price;

    @Size(max = 50)
    private String size;

    @Size(max = 500)
    private String description;

    private boolean active = true;
}
