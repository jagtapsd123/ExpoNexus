package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "facility_requests", indexes = {
    @Index(name = "idx_fr_exhibitor", columnList = "exhibitor_id"),
    @Index(name = "idx_fr_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_fr_status", columnList = "status")
})

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityRequest extends BaseEntity {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public int getChairs() {
		return chairs;
	}

	public void setChairs(int chairs) {
		this.chairs = chairs;
	}

	public int getTables() {
		return tables;
	}

	public void setTables(int tables) {
		this.tables = tables;
	}

	public int getLights() {
		return lights;
	}

	public void setLights(int lights) {
		this.lights = lights;
	}

	public boolean isElectricityRequired() {
		return electricityRequired;
	}

	public void setElectricityRequired(boolean electricityRequired) {
		this.electricityRequired = electricityRequired;
	}

	public String getCustomRequirements() {
		return customRequirements;
	}

	public void setCustomRequirements(String customRequirements) {
		this.customRequirements = customRequirements;
	}

	public FacilityStatus getStatus() {
		return status;
	}

	public void setStatus(FacilityStatus status) {
		this.status = status;
	}

	public String getFulfilledByNote() {
		return fulfilledByNote;
	}

	public void setFulfilledByNote(String fulfilledByNote) {
		this.fulfilledByNote = fulfilledByNote;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    @Column(nullable = false)
    @Builder.Default
    private int chairs = 0;

    @Column(nullable = false)
    @Builder.Default
    private int tables = 0;

    @Column(nullable = false)
    @Builder.Default
    private int lights = 0;

    @Column(name = "electricity_required")
    @Builder.Default
    private boolean electricityRequired = false;

    @Column(name = "custom_requirements", length = 1000)
    private String customRequirements;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FacilityStatus status = FacilityStatus.PENDING;

    @Column(name = "fulfilled_by_note", length = 500)
    private String fulfilledByNote;

    public enum FacilityStatus {
        PENDING, FULFILLED, REJECTED
    }
}
