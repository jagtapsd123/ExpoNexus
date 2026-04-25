package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateSaleRequest {

    @NotNull(message = "Exhibition is required")
    private Long exhibitionId;

    @NotNull(message = "Product is required")
    private Long productId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;

    private String paymentMode = "CASH";
    private String note;

    public Long getExhibitionId() { return exhibitionId; }
    public void setExhibitionId(Long exhibitionId) { this.exhibitionId = exhibitionId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
