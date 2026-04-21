package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Booking;
import com.amrut.peth.stallbooker.entity.Invoice;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InvoiceDto {

    private Long id;
    private String invoiceNumber;
    private Long bookingId;
    private String bookingNumber;
    private Long exhibitorId;
    private String exhibitorName;
    private String exhibitorEmail;
    private String businessName;
    private String exhibitionName;
    private String stallNumber;
    private String stallCategory;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private int days;
    private double pricePerDay;
    private double subtotal;
    private double gst;
    private double gstRate;
    private double total;
    private boolean paid;
    private LocalDate generatedAt;
    private String pdfUrl;
    private LocalDateTime createdAt;

    public InvoiceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }

    public Long getExhibitorId() { return exhibitorId; }
    public void setExhibitorId(Long exhibitorId) { this.exhibitorId = exhibitorId; }

    public String getExhibitorName() { return exhibitorName; }
    public void setExhibitorName(String exhibitorName) { this.exhibitorName = exhibitorName; }

    public String getExhibitorEmail() { return exhibitorEmail; }
    public void setExhibitorEmail(String exhibitorEmail) { this.exhibitorEmail = exhibitorEmail; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getExhibitionName() { return exhibitionName; }
    public void setExhibitionName(String exhibitionName) { this.exhibitionName = exhibitionName; }

    public String getStallNumber() { return stallNumber; }
    public void setStallNumber(String stallNumber) { this.stallNumber = stallNumber; }

    public String getStallCategory() { return stallCategory; }
    public void setStallCategory(String stallCategory) { this.stallCategory = stallCategory; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public double getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(double pricePerDay) { this.pricePerDay = pricePerDay; }

    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }

    public double getGst() { return gst; }
    public void setGst(double gst) { this.gst = gst; }

    public double getGstRate() { return gstRate; }
    public void setGstRate(double gstRate) { this.gstRate = gstRate; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public LocalDate getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDate generatedAt) { this.generatedAt = generatedAt; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static InvoiceDto from(Invoice inv) {
        Booking b = inv.getBooking();
        InvoiceDto dto = new InvoiceDto();
        dto.id = inv.getId();
        dto.invoiceNumber = inv.getInvoiceNumber();
        dto.bookingId = b.getId();
        dto.bookingNumber = b.getBookingNumber();
        dto.exhibitorId = inv.getExhibitor().getId();
        dto.exhibitorName = inv.getExhibitor().getName();
        dto.exhibitorEmail = inv.getExhibitor().getEmail();
        dto.businessName = b.getBusinessName();
        dto.exhibitionName = b.getExhibition().getName();
        dto.stallNumber = b.getStallNumber();
        dto.stallCategory = b.getStallCategory().name().toLowerCase();
        dto.venue = b.getExhibition().getVenue();
        dto.startDate = b.getStartDate();
        dto.endDate = b.getEndDate();
        dto.days = b.getDays();
        dto.pricePerDay = b.getPricePerDay();
        dto.subtotal = inv.getSubtotal();
        dto.gst = inv.getGst();
        dto.gstRate = inv.getGstRate();
        dto.total = inv.getTotal();
        dto.paid = inv.isPaid();
        dto.generatedAt = inv.getGeneratedAt();
        dto.pdfUrl = inv.getPdfUrl();
        dto.createdAt = inv.getCreatedAt();
        return dto;
    }
}
