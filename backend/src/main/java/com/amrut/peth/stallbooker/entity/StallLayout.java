package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stall_layouts")

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StallLayout extends BaseEntity {

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

	public LayoutMode getMode() {
		return mode;
	}

	public void setMode(LayoutMode mode) {
		this.mode = mode;
	}

	public String getLayoutImageUrl() {
		return layoutImageUrl;
	}

	public void setLayoutImageUrl(String layoutImageUrl) {
		this.layoutImageUrl = layoutImageUrl;
	}

	public int getPrimeCount() {
		return primeCount;
	}

	public void setPrimeCount(int primeCount) {
		this.primeCount = primeCount;
	}

	public int getSuperCount() {
		return superCount;
	}

	public void setSuperCount(int superCount) {
		this.superCount = superCount;
	}

	public int getGeneralCount() {
		return generalCount;
	}

	public void setGeneralCount(int generalCount) {
		this.generalCount = generalCount;
	}

	public double getPrimePrice() {
		return primePrice;
	}

	public void setPrimePrice(double primePrice) {
		this.primePrice = primePrice;
	}

	public double getSuperPrice() {
		return superPrice;
	}

	public void setSuperPrice(double superPrice) {
		this.superPrice = superPrice;
	}

	public double getGeneralPrice() {
		return generalPrice;
	}

	public void setGeneralPrice(double generalPrice) {
		this.generalPrice = generalPrice;
	}

	public List<StallMarker> getMarkers() {
		return markers;
	}

	public void setMarkers(List<StallMarker> markers) {
		this.markers = markers;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibition_id", nullable = false, unique = true)
    private Exhibition exhibition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private LayoutMode mode = LayoutMode.GRID;

    @Column(name = "layout_image_url", length = 1000)
    private String layoutImageUrl;

    // Category counts for grid generation
    @Column(name = "prime_count")
    @Builder.Default
    private int primeCount = 0;

    @Column(name = "super_count")
    @Builder.Default
    private int superCount = 0;

    @Column(name = "general_count")
    @Builder.Default
    private int generalCount = 0;

    // Category prices
    @Column(name = "prime_price")
    @Builder.Default
    private double primePrice = 0;

    @Column(name = "super_price")
    @Builder.Default
    private double superPrice = 0;

    @Column(name = "general_price")
    @Builder.Default
    private double generalPrice = 0;

    @OneToMany(mappedBy = "layout", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<StallMarker> markers = new ArrayList<>();

    public enum LayoutMode {
        GRID, IMAGE
    }
}
