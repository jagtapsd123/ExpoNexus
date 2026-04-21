package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "invoices", indexes = {
    @Index(name = "idx_invoices_booking", columnList = "booking_id"),
    @Index(name = "idx_invoices_number", columnList = "invoice_number", unique = true),
    @Index(name = "idx_invoices_exhibitor", columnList = "exhibitor_id")
})

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice extends BaseEntity {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}

	public Booking getBooking() {
		return booking;
	}

	public void setBooking(Booking booking) {
		this.booking = booking;
	}

	public User getExhibitor() {
		return exhibitor;
	}

	public void setExhibitor(User exhibitor) {
		this.exhibitor = exhibitor;
	}

	public LocalDate getGeneratedAt() {
		return generatedAt;
	}

	public void setGeneratedAt(LocalDate generatedAt) {
		this.generatedAt = generatedAt;
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

	public double getGstRate() {
		return gstRate;
	}

	public void setGstRate(double gstRate) {
		this.gstRate = gstRate;
	}

	public double getTotal() {
		return total;
	}

	public void setTotal(double total) {
		this.total = total;
	}

	public boolean isPaid() {
		return paid;
	}

	public void setPaid(boolean paid) {
		this.paid = paid;
	}

	public String getPdfUrl() {
		return pdfUrl;
	}

	public void setPdfUrl(String pdfUrl) {
		this.pdfUrl = pdfUrl;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", unique = true, nullable = false, length = 30)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @Column(name = "generated_at", nullable = false)
    private LocalDate generatedAt;

    @Column(nullable = false)
    private double subtotal;

    @Column(nullable = false)
    private double gst;

    @Column(name = "gst_rate")
    @Builder.Default
    private double gstRate = 18.0;

    @Column(nullable = false)
    private double total;

    @Column(name = "paid")
    @Builder.Default
    private boolean paid = false;

    @Column(name = "pdf_url", length = 1000)
    private String pdfUrl;
}
