package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "stalls", indexes = {
    @Index(name = "idx_stalls_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_stalls_status", columnList = "status"),
    @Index(name = "idx_stalls_category", columnList = "category"),
    @Index(name = "idx_stalls_number", columnList = "stall_number")
    })

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stall extends BaseEntity {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Exhibition getExhibition() {
		return exhibition;
	}

	public void setExhibition(Exhibition exhibition) {
		this.exhibition = exhibition;
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

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public StallStatus getStatus() {
		return status;
	}

	public void setStatus(StallStatus status) {
		this.status = status;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public User getBookedBy() {
		return bookedBy;
	}

	public void setBookedBy(User bookedBy) {
		this.bookedBy = bookedBy;
	}

	public Set<FacilityType> getFacilities() {
		return facilities;
	}

	public void setFacilities(Set<FacilityType> facilities) {
		this.facilities = facilities;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    @Column(name = "stall_number", nullable = false, length = 20)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StallCategoryConfig.StallCategory category;

    @Column(nullable = false)
    private double price;

    @Column(length = 50)
    private String size;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StallStatus status = StallStatus.AVAILABLE;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booked_by_user_id")
    private User bookedBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "stall_facilities",
        joinColumns = @JoinColumn(name = "stall_id"),
        inverseJoinColumns = @JoinColumn(name = "facility_id")
    )
    @Builder.Default
    private Set<FacilityType> facilities = new HashSet<>();

    public enum StallStatus {
        AVAILABLE, BOOKED, RESERVED, BLOCKED, UNAVAILABLE
    }
}
