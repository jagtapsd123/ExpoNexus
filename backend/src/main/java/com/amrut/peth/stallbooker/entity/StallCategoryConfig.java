package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stall_category_configs", indexes = {
    @Index(name = "idx_scc_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_scc_category", columnList = "category")
})

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StallCategoryConfig extends BaseEntity {

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

	public StallCategory getCategory() {
		return category;
	}

	public void setCategory(StallCategory category) {
		this.category = category;
	}

	public int getTotal() {
		return total;
	}

	public void setTotal(int total) {
		this.total = total;
	}

	public int getBooked() {
		return booked;
	}

	public void setBooked(int booked) {
		this.booked = booked;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StallCategory category;

    @Column(nullable = false)
    private int total;

    @Column(nullable = false)
    @Builder.Default
    private int booked = 0;

    @Column(nullable = false)
    private double price;

    public enum StallCategory {
        PRIME, SUPER, GENERAL
    }
}
