package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Product;

import java.time.LocalDateTime;

public class ProductDto {

    private Long id;
    private Long exhibitorId;
    private String exhibitorName;
    private String name;
    private String description;
    private double price;
    private String stockStatus;
    private boolean active;
    private LocalDateTime createdAt;

    public ProductDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getExhibitorId() { return exhibitorId; }
    public void setExhibitorId(Long exhibitorId) { this.exhibitorId = exhibitorId; }

    public String getExhibitorName() { return exhibitorName; }
    public void setExhibitorName(String exhibitorName) { this.exhibitorName = exhibitorName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ProductDto from(Product p) {
        ProductDto dto = new ProductDto();
        dto.id = p.getId();
        dto.exhibitorId = p.getExhibitor().getId();
        dto.exhibitorName = p.getExhibitor().getName();
        dto.name = p.getName();
        dto.description = p.getDescription();
        dto.price = p.getPrice();
        dto.stockStatus = p.getStockStatus().name().toLowerCase();
        dto.active = p.isActive();
        dto.createdAt = p.getCreatedAt();
        return dto;
    }
}
