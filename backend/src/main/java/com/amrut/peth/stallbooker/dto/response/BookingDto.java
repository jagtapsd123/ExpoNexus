package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDto {

    private Long id;
    private String bookingNumber;
    private Long exhibitorId;
    private String memberId;
    private String exhibitorName;
    private String exhibitorEmail;
    private Long exhibitionId;
    private String eventId;
    private String exhibitionName;
    private Long stallId;
    private String stallNumber;
    private String stallCategory;
    private String businessName;
    private String productCategory;
    private LocalDate startDate;
    private LocalDate endDate;
    private int days;
    private double pricePerDay;
    private double subtotal;
    private double gst;
    private double total;
    private String specialRequirements;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime createdAt;
  

	public BookingDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }

    public Long getExhibitorId() { return exhibitorId; }
    public void setExhibitorId(Long exhibitorId) { this.exhibitorId = exhibitorId; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getExhibitorName() { return exhibitorName; }
    public void setExhibitorName(String exhibitorName) { this.exhibitorName = exhibitorName; }

    public String getExhibitorEmail() { return exhibitorEmail; }
    public void setExhibitorEmail(String exhibitorEmail) { this.exhibitorEmail = exhibitorEmail; }

    public Long getExhibitionId() { return exhibitionId; }
    public void setExhibitionId(Long exhibitionId) { this.exhibitionId = exhibitionId; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getExhibitionName() { return exhibitionName; }
    public void setExhibitionName(String exhibitionName) { this.exhibitionName = exhibitionName; }

    public Long getStallId() { return stallId; }
    public void setStallId(Long stallId) { this.stallId = stallId; }

    public String getStallNumber() { return stallNumber; }
    public void setStallNumber(String stallNumber) { this.stallNumber = stallNumber; }

    public String getStallCategory() { return stallCategory; }
    public void setStallCategory(String stallCategory) { this.stallCategory = stallCategory; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getProductCategory() { return productCategory; }
    public void setProductCategory(String productCategory) { this.productCategory = productCategory; }

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

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getSpecialRequirements() { return specialRequirements; }
    public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static BookingDto from(Booking b) {
        BookingDto dto = new BookingDto();
        dto.id = b.getId();
        dto.bookingNumber = b.getBookingNumber();
        dto.exhibitorId = b.getExhibitor().getId();
        dto.memberId = b.getExhibitor().getMemberId();
        dto.exhibitorName = b.getExhibitor().getName();
        dto.exhibitorEmail = b.getExhibitor().getEmail();
        dto.exhibitionId = b.getExhibition().getId();
        dto.eventId = b.getExhibition().getEventId();
        dto.exhibitionName = b.getExhibition().getName();
        dto.stallId = b.getStall().getId();
        dto.stallNumber = b.getStallNumber();
        dto.stallCategory = b.getStallCategory().name().toLowerCase();
        dto.businessName = b.getBusinessName();
        dto.productCategory = b.getProductCategory();
        dto.startDate = b.getStartDate();
        dto.endDate = b.getEndDate();
        dto.days = b.getDays();
        dto.pricePerDay = b.getPricePerDay();
        dto.subtotal = b.getSubtotal();
        dto.gst = b.getGst();
        dto.total = b.getTotal();
        dto.specialRequirements = b.getSpecialRequirements();
        dto.status = b.getStatus().name().toLowerCase();
        dto.paymentStatus = b.getPaymentStatus().name().toLowerCase();
        dto.paymentMethod = b.getPaymentMethod() != null ? b.getPaymentMethod().name().toLowerCase() : null;
        dto.createdAt = b.getCreatedAt();
        return dto;
    }
}
