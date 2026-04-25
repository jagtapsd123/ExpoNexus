package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateExhibitionRequest {

   	@NotBlank(message = "Exhibition name is required")
    @Size(max = 300, message = "Name too long")
    private String name;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Size(max = 100)
    private String time;

    @NotBlank(message = "Venue is required")
    @Size(max = 500)
    private String venue;

    @Size(max = 2000)
    private String description;

    @Size(max = 300)
    private String organizerName;

    @NotNull(message = "Stall configuration is required")
    @Valid
    private StallConfig stallConfig;

    @Data
    public static class StallConfig {

        @Min(0) int primeCount;
        @Min(0) double primePrice;

        @Min(0) int superCount;
        @Min(0) double superPrice;

        @Min(0) int generalCount;
        @Min(0) double generalPrice;
		public int getPrimeCount() {
			return primeCount;
		}
		public void setPrimeCount(int primeCount) {
			this.primeCount = primeCount;
		}
		public double getPrimePrice() {
			return primePrice;
		}
		public void setPrimePrice(double primePrice) {
			this.primePrice = primePrice;
		}
		public int getSuperCount() {
			return superCount;
		}
		public void setSuperCount(int superCount) {
			this.superCount = superCount;
		}
		public double getSuperPrice() {
			return superPrice;
		}
		public void setSuperPrice(double superPrice) {
			this.superPrice = superPrice;
		}
		public int getGeneralCount() {
			return generalCount;
		}
		public void setGeneralCount(int generalCount) {
			this.generalCount = generalCount;
		}
		public double getGeneralPrice() {
			return generalPrice;
		}
		public void setGeneralPrice(double generalPrice) {
			this.generalPrice = generalPrice;
		}
        
        
    }

    private List<Long> assignedOrganizerIds;

    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateValid() {
        if (startDate == null || endDate == null) return true;
        return !endDate.isBefore(startDate);
    }
    
    
    public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public String getVenue() {
		return venue;
	}

	public void setVenue(String venue) {
		this.venue = venue;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getOrganizerName() { return organizerName; }
	public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

	public StallConfig getStallConfig() {
		return stallConfig;
	}

	public void setStallConfig(StallConfig stallConfig) {
		this.stallConfig = stallConfig;
	}

	public List<Long> getAssignedOrganizerIds() {
		return assignedOrganizerIds;
	}

	public void setAssignedOrganizerIds(List<Long> assignedOrganizerIds) {
		this.assignedOrganizerIds = assignedOrganizerIds;
	}


}
