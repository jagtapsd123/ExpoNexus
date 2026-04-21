package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gallery_images", indexes = {
    @Index(name = "idx_gi_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_gi_type", columnList = "image_type")
})

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryImage extends BaseEntity {

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

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public String getAltText() {
		return altText;
	}

	public void setAltText(String altText) {
		this.altText = altText;
	}

	public ImageType getImageType() {
		return imageType;
	}

	public void setImageType(ImageType imageType) {
		this.imageType = imageType;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exhibition_id")
    private Exhibition exhibition;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "alt_text", length = 300)
    private String altText;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", nullable = false, length = 20)
    @Builder.Default
    private ImageType imageType = ImageType.EXHIBITION;

    @Column(name = "sort_order")
    @Builder.Default
    private int sortOrder = 0;

    public enum ImageType {
        EXHIBITION,  // per-exhibition gallery
        LANDING      // landing page slideshow
    }
}
