package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stall_markers", indexes = {
    @Index(name = "idx_sm_layout", columnList = "layout_id"),
    @Index(name = "idx_sm_status", columnList = "status")
})

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StallMarker extends BaseEntity {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public StallLayout getLayout() {
		return layout;
	}

	public void setLayout(StallLayout layout) {
		this.layout = layout;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public StallCategoryConfig.StallCategory getCategory() {
		return category;
	}

	public void setCategory(StallCategoryConfig.StallCategory category) {
		this.category = category;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public MarkerStatus getStatus() {
		return status;
	}

	public void setStatus(MarkerStatus status) {
		this.status = status;
	}

	public double getX() {
		return x;
	}

	public void setX(double x) {
		this.x = x;
	}

	public double getY() {
		return y;
	}

	public void setY(double y) {
		this.y = y;
	}

	public double getW() {
		return w;
	}

	public void setW(double w) {
		this.w = w;
	}

	public double getH() {
		return h;
	}

	public void setH(double h) {
		this.h = h;
	}

	public User getBookedBy() {
		return bookedBy;
	}

	public void setBookedBy(User bookedBy) {
		this.bookedBy = bookedBy;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "layout_id", nullable = false)
    private StallLayout layout;

    @Column(nullable = false, length = 20)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StallCategoryConfig.StallCategory category;

    @Column(nullable = false)
    private double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MarkerStatus status = MarkerStatus.AVAILABLE;

    /** Position as % of canvas width (0-100) */
    @Column(nullable = false)
    private double x;

    /** Position as % of canvas height (0-100) */
    @Column(nullable = false)
    private double y;

    /** Width as % of canvas width (0-100) */
    @Column(nullable = false)
    @Builder.Default
    private double w = 8.0;

    /** Height as % of canvas height (0-100) */
    @Column(nullable = false)
    @Builder.Default
    private double h = 8.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booked_by_user_id")
    private User bookedBy;

    public enum MarkerStatus {
        AVAILABLE, BOOKED, RESERVED, BLOCKED
    }
}
