package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_exhibitor", columnList = "exhibitor_id"),
    @Index(name = "idx_bookings_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_bookings_stall", columnList = "stall_id"),
    @Index(name = "idx_bookings_status", columnList = "status"),
    @Index(name = "idx_bookings_payment_status", columnList = "payment_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_number", unique = true, nullable = false, length = 30)
    private String bookingNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stall_id", nullable = false)
    private Stall stall;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StallCategoryConfig.StallCategory stallCategory;

    @Column(name = "stall_number", nullable = false, length = 20)
    private String stallNumber;
    private double gstAmount;


    public double getGstAmount() {
		return gstAmount;
	}

	public void setGstAmount(double gstAmount) {
		this.gstAmount = gstAmount;
	}

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getBookingNumber() {
		return bookingNumber;
	}

	public void setBookingNumber(String bookingNumber) {
		this.bookingNumber = bookingNumber;
	}

	public User getExhibitor() {
		return exhibitor;
	}

	public void setExhibitor(User exhibitor) {
		this.exhibitor = exhibitor;
	}

	public Exhibition getExhibition() {
		return exhibition;
	}

	public void setExhibition(Exhibition exhibition) {
		this.exhibition = exhibition;
	}

	public Stall getStall() {
		return stall;
	}

	public void setStall(Stall stall) {
		this.stall = stall;
	}

	public StallCategoryConfig.StallCategory getStallCategory() {
		return stallCategory;
	}

	public void setStallCategory(StallCategoryConfig.StallCategory stallCategory) {
		this.stallCategory = stallCategory;
	}

	public String getStallNumber() {
		return stallNumber;
	}

	public void setStallNumber(String stallNumber) {
		this.stallNumber = stallNumber;
	}

	public String getBusinessName() {
		return businessName;
	}

	public void setBusinessName(String businessName) {
		this.businessName = businessName;
	}

	public String getProductCategory() {
		return productCategory;
	}

	public void setProductCategory(String productCategory) {
		this.productCategory = productCategory;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public int getDays() {
		return days;
	}

	public void setDays(int days) {
		this.days = days;
	}

	public double getPricePerDay() {
		return pricePerDay;
	}

	public void setPricePerDay(double pricePerDay) {
		this.pricePerDay = pricePerDay;
	}

	public double getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(double subtotal) {
		this.subtotal = subtotal;
	}

	public double getGst() {
		return gst;
	}

	public void setGst(double gst) {
		this.gst = gst;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public String getSpecialRequirements() {
		return specialRequirements;
	}

	public void setSpecialRequirements(String specialRequirements) {
		this.specialRequirements = specialRequirements;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public PaymentStatus getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(PaymentStatus paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public PaymentMethod getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(PaymentMethod paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getPaymentReference() {
		return paymentReference;
	}

	public void setPaymentReference(String paymentReference) {
		this.paymentReference = paymentReference;
	}

	public Invoice getInvoice() {
		return invoice;
	}

	public void setInvoice(Invoice invoice) {
		this.invoice = invoice;
	}

	@Column(name = "business_name", length = 200)
    private String businessName;

    @Column(name = "product_category", length = 100)
    private String productCategory;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private int days;

    @Column(name = "price_per_day", nullable = false)
    private double pricePerDay;

    @Column(nullable = false)
    private double subtotal;

    @Column(nullable = false)
    private double gst;

    @Column(nullable = false)
    private double total;

    @Column(name = "special_requirements", length = 1000)
    private String specialRequirements;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 30)
    private PaymentMethod paymentMethod;

    @Column(name = "payment_reference", length = 200)
    private String paymentReference;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Invoice invoice;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }

    public enum PaymentStatus {
        PENDING, PAID, REFUNDED, FAILED
    }

    public enum PaymentMethod {
        UPI, CARD, NET_BANKING, CASH, BANK_TRANSFER
    }
}
