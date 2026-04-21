package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.FacilityRequest;

import java.time.LocalDateTime;

public class FacilityRequestDto {

    private Long id;
    private Long exhibitorId;
    private String exhibitorName;
    private Long exhibitionId;
    private String exhibitionName;
    private int chairs;
    private int tables;
    private int lights;
    private boolean electricityRequired;
    private String customRequirements;
    private String status;
    private String fulfilledByNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FacilityRequestDto() {}

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

    public int getChairs() { return chairs; }
    public void setChairs(int chairs) { this.chairs = chairs; }

    public int getTables() { return tables; }
    public void setTables(int tables) { this.tables = tables; }

    public int getLights() { return lights; }
    public void setLights(int lights) { this.lights = lights; }

    public boolean isElectricityRequired() { return electricityRequired; }
    public void setElectricityRequired(boolean electricityRequired) { this.electricityRequired = electricityRequired; }

    public String getCustomRequirements() { return customRequirements; }
    public void setCustomRequirements(String customRequirements) { this.customRequirements = customRequirements; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFulfilledByNote() { return fulfilledByNote; }
    public void setFulfilledByNote(String fulfilledByNote) { this.fulfilledByNote = fulfilledByNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static FacilityRequestDto from(FacilityRequest r) {
        FacilityRequestDto dto = new FacilityRequestDto();
        dto.id = r.getId();
        dto.exhibitorId = r.getExhibitor().getId();
        dto.exhibitorName = r.getExhibitor().getName();
        dto.exhibitionId = r.getExhibition().getId();
        dto.exhibitionName = r.getExhibition().getName();
        dto.chairs = r.getChairs();
        dto.tables = r.getTables();
        dto.lights = r.getLights();
        dto.electricityRequired = r.isElectricityRequired();
        dto.customRequirements = r.getCustomRequirements();
        dto.status = r.getStatus().name().toLowerCase();
        dto.fulfilledByNote = r.getFulfilledByNote();
        dto.createdAt = r.getCreatedAt();
        dto.updatedAt = r.getUpdatedAt();
        return dto;
    }
}
