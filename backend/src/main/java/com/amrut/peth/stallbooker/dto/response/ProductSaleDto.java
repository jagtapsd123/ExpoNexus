package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.ProductSale;

import java.time.LocalDateTime;

public class ProductSaleDto {

    private Long id;
    private Long productId;
    private String productName;
    private Long exhibitionId;
    private String exhibitionName;
    private int quantity;
    private double unitPrice;
    private double total;
    private String paymentMode;
    private String note;
    private LocalDateTime soldAt;

    public static ProductSaleDto from(ProductSale s) {
        ProductSaleDto dto = new ProductSaleDto();
        dto.id = s.getId();
        dto.productId = s.getProduct().getId();
        dto.productName = s.getProduct().getName();
        dto.exhibitionId = s.getExhibition().getId();
        dto.exhibitionName = s.getExhibition().getName();
        dto.quantity = s.getQuantity();
        dto.unitPrice = s.getUnitPrice();
        dto.total = s.getTotal();
        dto.paymentMode = s.getPaymentMode();
        dto.note = s.getNote();
        dto.soldAt = s.getSoldAt();
        return dto;
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public Long getExhibitionId() { return exhibitionId; }
    public String getExhibitionName() { return exhibitionName; }
    public int getQuantity() { return quantity; }
    public double getUnitPrice() { return unitPrice; }
    public double getTotal() { return total; }
    public String getPaymentMode() { return paymentMode; }
    public String getNote() { return note; }
    public LocalDateTime getSoldAt() { return soldAt; }
}
