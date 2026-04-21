package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.StallLayout;
import com.amrut.peth.stallbooker.entity.StallMarker;

import java.time.LocalDateTime;
import java.util.List;

public class StallLayoutDto {

    private Long id;
    private Long exhibitionId;
    private String mode;
    private String layoutImageUrl;
    private int primeCount;
    private int superCount;
    private int generalCount;
    private double primePrice;
    private double superPrice;
    private double generalPrice;
    private List<MarkerDto> markers;
    private LocalDateTime updatedAt;

    public StallLayoutDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getExhibitionId() { return exhibitionId; }
    public void setExhibitionId(Long exhibitionId) { this.exhibitionId = exhibitionId; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getLayoutImageUrl() { return layoutImageUrl; }
    public void setLayoutImageUrl(String layoutImageUrl) { this.layoutImageUrl = layoutImageUrl; }

    public int getPrimeCount() { return primeCount; }
    public void setPrimeCount(int primeCount) { this.primeCount = primeCount; }

    public int getSuperCount() { return superCount; }
    public void setSuperCount(int superCount) { this.superCount = superCount; }

    public int getGeneralCount() { return generalCount; }
    public void setGeneralCount(int generalCount) { this.generalCount = generalCount; }

    public double getPrimePrice() { return primePrice; }
    public void setPrimePrice(double primePrice) { this.primePrice = primePrice; }

    public double getSuperPrice() { return superPrice; }
    public void setSuperPrice(double superPrice) { this.superPrice = superPrice; }

    public double getGeneralPrice() { return generalPrice; }
    public void setGeneralPrice(double generalPrice) { this.generalPrice = generalPrice; }

    public List<MarkerDto> getMarkers() { return markers; }
    public void setMarkers(List<MarkerDto> markers) { this.markers = markers; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static StallLayoutDto from(StallLayout l) {
        StallLayoutDto dto = new StallLayoutDto();
        dto.id = l.getId();
        dto.exhibitionId = l.getExhibition().getId();
        dto.mode = l.getMode().name().toLowerCase();
        dto.layoutImageUrl = l.getLayoutImageUrl();
        dto.primeCount = l.getPrimeCount();
        dto.superCount = l.getSuperCount();
        dto.generalCount = l.getGeneralCount();
        dto.primePrice = l.getPrimePrice();
        dto.superPrice = l.getSuperPrice();
        dto.generalPrice = l.getGeneralPrice();
        dto.markers = l.getMarkers().stream().map(MarkerDto::from).toList();
        dto.updatedAt = l.getUpdatedAt();
        return dto;
    }

    public static class MarkerDto {
        private Long id;
        private String number;
        private String category;
        private double price;
        private String status;
        private double x;
        private double y;
        private double w;
        private double h;
        private Long bookedByUserId;

        public MarkerDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getNumber() { return number; }
        public void setNumber(String number) { this.number = number; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public double getX() { return x; }
        public void setX(double x) { this.x = x; }

        public double getY() { return y; }
        public void setY(double y) { this.y = y; }

        public double getW() { return w; }
        public void setW(double w) { this.w = w; }

        public double getH() { return h; }
        public void setH(double h) { this.h = h; }

        public Long getBookedByUserId() { return bookedByUserId; }
        public void setBookedByUserId(Long bookedByUserId) { this.bookedByUserId = bookedByUserId; }

        public static MarkerDto from(StallMarker m) {
            MarkerDto dto = new MarkerDto();
            dto.id = m.getId();
            dto.number = m.getNumber();
            dto.category = m.getCategory().name().toLowerCase();
            dto.price = m.getPrice();
            dto.status = m.getStatus().name().toLowerCase();
            dto.x = m.getX();
            dto.y = m.getY();
            dto.w = m.getW();
            dto.h = m.getH();
            dto.bookedByUserId = m.getBookedBy() != null ? m.getBookedBy().getId() : null;
            return dto;
        }
    }
}
