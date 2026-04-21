package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateComplaintRequest {

    public Long getExhibitionId() {
		return exhibitionId;
	}

	public void setExhibitionId(Long exhibitionId) {
		this.exhibitionId = exhibitionId;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@NotNull(message = "Exhibition ID is required")
    private Long exhibitionId;

    @NotBlank(message = "Subject is required")
    @Size(max = 300)
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(max = 3000)
    private String description;
}
