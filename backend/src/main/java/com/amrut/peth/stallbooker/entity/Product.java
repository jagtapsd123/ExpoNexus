package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_products_exhibitor",    columnList = "exhibitor_id"),
    @Index(name = "idx_products_stock_status", columnList = "stock_status")
})
public class Product extends BaseEntity {

    public enum StockStatus { IN_STOCK, OUT_OF_STOCK }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private double price;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", nullable = false, length = 20)
    private StockStatus stockStatus = StockStatus.IN_STOCK;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getExhibitor() { return exhibitor; }
    public void setExhibitor(User exhibitor) { this.exhibitor = exhibitor; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public StockStatus getStockStatus() { return stockStatus; }
    public void setStockStatus(StockStatus stockStatus) { this.stockStatus = stockStatus; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
