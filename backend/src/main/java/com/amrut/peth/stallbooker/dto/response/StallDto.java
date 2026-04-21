package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Stall;

import java.time.LocalDateTime;

public class StallDto {

    private Long id;
    private Long exhibitionId;
    private String exhibitionName;
    private String number;
    private String category;
    private double price;
    private String size;
    private String description;
    private String status;
    private boolean active;
    private Long bookedByUserId;
    private String bookedByName;
    private LocalDateTime createdAt;

    public StallDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getExhibitionId() { return exhibitionId; }
    public void setExhibitionId(Long exhibitionId) { this.exhibitionId = exhibitionId; }

    public String getExhibitionName() { return exhibitionName; }
    public void setExhibitionName(String exhibitionName) { this.exhibitionName = exhibitionName; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Long getBookedByUserId() { return bookedByUserId; }
    public void setBookedByUserId(Long bookedByUserId) { this.bookedByUserId = bookedByUserId; }

    public String getBookedByName() { return bookedByName; }
    public void setBookedByName(String bookedByName) { this.bookedByName = bookedByName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static StallDto from(Stall s) {
        StallDto dto = new StallDto();
        dto.id = s.getId();
        dto.exhibitionId = s.getExhibition().getId();
        dto.exhibitionName = s.getExhibition().getName();
        dto.number = s.getNumber();
        dto.category = s.getCategory().name().toLowerCase();
        dto.price = s.getPrice();
        dto.size = s.getSize();
        dto.description = s.getDescription();
        dto.status = s.getStatus().name().toLowerCase();
        dto.active = s.isActive();
        dto.bookedByUserId = s.getBookedBy() != null ? s.getBookedBy().getId() : null;
        dto.bookedByName = s.getBookedBy() != null ? s.getBookedBy().getName() : null;
        dto.createdAt = s.getCreatedAt();
        return dto;
    }
}
