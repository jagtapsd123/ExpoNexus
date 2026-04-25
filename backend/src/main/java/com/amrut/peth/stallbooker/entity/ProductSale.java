package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_sales", indexes = {
    @Index(name = "idx_psales_exhibitor",  columnList = "exhibitor_id"),
    @Index(name = "idx_psales_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_psales_product",    columnList = "product_id"),
    @Index(name = "idx_psales_sold_at",    columnList = "sold_at")
})
public class ProductSale extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price", nullable = false)
    private double unitPrice;

    @Column(nullable = false)
    private double total;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode = "CASH";

    @Column(length = 500)
    private String note;

    @Column(name = "sold_at", nullable = false)
    private LocalDateTime soldAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getExhibitor() { return exhibitor; }
    public void setExhibitor(User exhibitor) { this.exhibitor = exhibitor; }

    public Exhibition getExhibition() { return exhibition; }
    public void setExhibition(Exhibition exhibition) { this.exhibition = exhibition; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getSoldAt() { return soldAt; }
    public void setSoldAt(LocalDateTime soldAt) { this.soldAt = soldAt; }
}
