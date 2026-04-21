package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Complaint;

import java.time.LocalDateTime;

public class ComplaintDto {

    private Long id;
    private Long exhibitorId;
    private String exhibitorName;
    private Long exhibitionId;
    private String exhibitionName;
    private String subject;
    private String description;
    private String status;
    private String resolutionNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ComplaintDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getExhibitorId() { return exhibitorId; }
    public void setExhibitorId(Long exhibitorId) { this.exhibitorId = exhibitorId; }

    public String getExhibitorName() { return exhibitorName; }
    public void setExhibitorName(String exhibitorName) { this.exhibitorName = exhibitorName; }

    public Long getExhibitionId() { return exhibitionId; }
    public void setExhibitionId(Long exhibitionId) { this.exhibitionId = exhibitionId; }

    public String getExhibitionName() { return exhibitionName; }
    public void setExhibitionName(String exhibitionName) { this.exhibitionName = exhibitionName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ComplaintDto from(Complaint c) {
        ComplaintDto dto = new ComplaintDto();
        dto.id = c.getId();
        dto.exhibitorId = c.getExhibitor().getId();
        dto.exhibitorName = c.getExhibitor().getName();
        dto.exhibitionId = c.getExhibition().getId();
        dto.exhibitionName = c.getExhibition().getName();
        dto.subject = c.getSubject();
        dto.description = c.getDescription();
        dto.status = c.getStatus().name().toLowerCase().replace("_", "-");
        dto.resolutionNote = c.getResolutionNote();
        dto.createdAt = c.getCreatedAt();
        dto.updatedAt = c.getUpdatedAt();
        return dto;
    }
}
