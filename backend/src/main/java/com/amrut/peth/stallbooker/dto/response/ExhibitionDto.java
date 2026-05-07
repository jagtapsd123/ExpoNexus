package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Exhibition;
import com.amrut.peth.stallbooker.entity.StallCategoryConfig;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ExhibitionDto {

    private Long id;
    private String eventId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String time;
    private String venue;
    private String description;
    private int totalStalls;
    private String status;
    private String layoutImageUrl;
    private String bannerImageUrl;
    private String organizerName;
    private String district;
    private boolean showRevenueToExhibitors;
    private List<StallCategoryDto> stallCategories;
    private List<String> videoLinks;
    private List<Long> assignedOrganizerIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ExhibitionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getTotalStalls() { return totalStalls; }
    public void setTotalStalls(int totalStalls) { this.totalStalls = totalStalls; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLayoutImageUrl() { return layoutImageUrl; }
    public void setLayoutImageUrl(String layoutImageUrl) { this.layoutImageUrl = layoutImageUrl; }

    public String getBannerImageUrl() { return bannerImageUrl; }
    public void setBannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public boolean isShowRevenueToExhibitors() { return showRevenueToExhibitors; }
    public void setShowRevenueToExhibitors(boolean showRevenueToExhibitors) { this.showRevenueToExhibitors = showRevenueToExhibitors; }

    public List<StallCategoryDto> getStallCategories() { return stallCategories; }
    public void setStallCategories(List<StallCategoryDto> stallCategories) { this.stallCategories = stallCategories; }

    public List<String> getVideoLinks() { return videoLinks; }
    public void setVideoLinks(List<String> videoLinks) { this.videoLinks = videoLinks; }

    public List<Long> getAssignedOrganizerIds() { return assignedOrganizerIds; }
    public void setAssignedOrganizerIds(List<Long> assignedOrganizerIds) { this.assignedOrganizerIds = assignedOrganizerIds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ExhibitionDto from(Exhibition e) {
        ExhibitionDto dto = new ExhibitionDto();
        dto.id = e.getId();
        dto.eventId = e.getEventId();
        dto.name = e.getName();
        dto.startDate = e.getStartDate();
        dto.endDate = e.getEndDate();
        dto.time = e.getTime();
        dto.venue = e.getVenue();
        dto.description = e.getDescription();
        dto.totalStalls = e.getTotalStalls();
        dto.status = e.getStatus().name().toLowerCase();
        dto.layoutImageUrl = e.getLayoutImageUrl();
        dto.bannerImageUrl = e.getBannerImageUrl();
        dto.organizerName = e.getOrganizerName();
        dto.district = e.getDistrict();
        dto.showRevenueToExhibitors = e.isShowRevenueToExhibitors();
        dto.stallCategories = e.getStallCategories().stream().map(StallCategoryDto::from).toList();
        dto.videoLinks = e.getVideoLinks();
        dto.assignedOrganizerIds = e.getAssignedOrganizers().stream().map(u -> u.getId()).toList();
        dto.createdAt = e.getCreatedAt();
        dto.updatedAt = e.getUpdatedAt();
        return dto;
    }

    public static class StallCategoryDto {
        private String category;
        private double price;
        private int total;
        private int booked;
        private int available;

        public StallCategoryDto() {}

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }

        public int getBooked() { return booked; }
        public void setBooked(int booked) { this.booked = booked; }

        public int getAvailable() { return available; }
        public void setAvailable(int available) { this.available = available; }

        public static StallCategoryDto from(StallCategoryConfig c) {
            StallCategoryDto dto = new StallCategoryDto();
            dto.category = c.getCategory().name().toLowerCase();
            dto.price = c.getPrice();
            dto.total = c.getTotal();
            dto.booked = c.getBooked();
            dto.available = c.getTotal() - c.getBooked();
            return dto;
        }
    }
}
