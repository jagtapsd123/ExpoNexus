package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_products_exhibitor",    columnList = "exhibitor_id"),
    @Index(name = "idx_products_exhibition",   columnList = "exhibition_id"),
    @Index(name = "idx_products_stock_status", columnList = "stock_status")
})
public class Product extends BaseEntity {

    public enum StockStatus { IN_STOCK, LOW_STOCK, OUT_OF_STOCK }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exhibition_id")
    private Exhibition exhibition;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private double price;

    @Column(name = "cost_price", nullable = false)
    private double costPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "sold_quantity", nullable = false)
    private int soldQuantity;

    @Column(length = 100)
    private String category;

    @Column(length = 100)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", nullable = false, length = 20)
    private StockStatus stockStatus = StockStatus.IN_STOCK;

    @Column(nullable = false)
    private boolean active = true;

    public int getRemainingQuantity() {
        return Math.max(0, quantity - soldQuantity);
    }

    public double getRevenue() {
        return price * soldQuantity;
    }

    public double getProfit() {
        return (price - costPrice) * soldQuantity;
    }

    public StockStatus computeStockStatus() {
        int remaining = getRemainingQuantity();
        if (remaining <= 0) return StockStatus.OUT_OF_STOCK;
        if (quantity > 0 && remaining <= (int) Math.ceil(quantity * 0.20)) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getExhibitor() { return exhibitor; }
    public void setExhibitor(User exhibitor) { this.exhibitor = exhibitor; }

    public Exhibition getExhibition() { return exhibition; }
    public void setExhibition(Exhibition exhibition) { this.exhibition = exhibition; }

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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public StockStatus getStockStatus() { return stockStatus; }
    public void setStockStatus(StockStatus stockStatus) { this.stockStatus = stockStatus; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
