package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateFacilityRequest {

    public Long getExhibitionId() {
		return exhibitionId;
	}

	public void setExhibitionId(Long exhibitionId) {
		this.exhibitionId = exhibitionId;
	}

	public int getChairs() {
		return chairs;
	}

	public void setChairs(int chairs) {
		this.chairs = chairs;
	}

	public int getTables() {
		return tables;
	}

	public void setTables(int tables) {
		this.tables = tables;
	}

	public int getLights() {
		return lights;
	}

	public void setLights(int lights) {
		this.lights = lights;
	}

	public boolean isElectricityRequired() {
		return electricityRequired;
	}

	public void setElectricityRequired(boolean electricityRequired) {
		this.electricityRequired = electricityRequired;
	}

	public String getCustomRequirements() {
		return customRequirements;
	}

	public void setCustomRequirements(String customRequirements) {
		this.customRequirements = customRequirements;
	}

	@NotNull(message = "Exhibition ID is required")
    private Long exhibitionId;

    @Min(0) private int chairs;
    @Min(0) private int tables;
    @Min(0) private int lights;

    private boolean electricityRequired;

    @Size(max = 1000)
    private String customRequirements;
}
