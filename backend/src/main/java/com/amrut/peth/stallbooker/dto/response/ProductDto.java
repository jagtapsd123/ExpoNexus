package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Product;

import java.time.LocalDateTime;

public class ProductDto {

    private Long id;
    private Long exhibitorId;
    private String exhibitorName;
    private Long exhibitionId;
    private String exhibitionName;
    private String name;
    private String description;
    private double price;
    private double costPrice;
    private int quantity;
    private int soldQuantity;
    private int remainingQuantity;
    private double revenue;
    private double profit;
    private String stockStatus;
    private String category;
    private String sku;
    private boolean active;
    private LocalDateTime createdAt;

    public ProductDto() {}

    public static ProductDto from(Product p) {
        ProductDto dto = new ProductDto();
        dto.id = p.getId();
        dto.exhibitorId = p.getExhibitor().getId();
        dto.exhibitorName = p.getExhibitor().getName();
        if (p.getExhibition() != null) {
            dto.exhibitionId = p.getExhibition().getId();
            dto.exhibitionName = p.getExhibition().getName();
        }
        dto.name = p.getName();
        dto.description = p.getDescription();
        dto.price = p.getPrice();
        dto.costPrice = p.getCostPrice();
        dto.quantity = p.getQuantity();
        dto.soldQuantity = p.getSoldQuantity();
        dto.remainingQuantity = p.getRemainingQuantity();
        dto.revenue = p.getRevenue();
        dto.profit = p.getProfit();
        dto.stockStatus = p.computeStockStatus().name().toLowerCase();
        dto.category = p.getCategory();
        dto.sku = p.getSku();
        dto.active = p.isActive();
        dto.createdAt = p.getCreatedAt();
        return dto;
    }

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

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getCostPrice() { return costPrice; }
    public void setCostPrice(double costPrice) { this.costPrice = costPrice; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(int soldQuantity) { this.soldQuantity = soldQuantity; }

    public int getRemainingQuantity() { return remainingQuantity; }
    public void setRemainingQuantity(int remainingQuantity) { this.remainingQuantity = remainingQuantity; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }

    public double getProfit() { return profit; }
    public void setProfit(double profit) { this.profit = profit; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
