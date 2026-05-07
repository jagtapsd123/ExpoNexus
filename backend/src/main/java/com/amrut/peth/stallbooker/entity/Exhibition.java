package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "exhibitions", indexes = {
    @Index(name = "idx_exhibitions_status",     columnList = "status"),
    @Index(name = "idx_exhibitions_start_date", columnList = "start_date"),
    @Index(name = "idx_exhibitions_end_date",   columnList = "end_date"),
    @Index(name = "idx_exhibitions_event_id",   columnList = "event_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exhibition extends BaseEntity {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEventId() {
		return eventId;
	}

	public void setEventId(String eventId) {
		this.eventId = eventId;
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

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public String getVenue() {
		return venue;
	}

	public void setVenue(String venue) {
		this.venue = venue;
	}

	public int getTotalStalls() {
		return totalStalls;
	}

	public void setTotalStalls(int totalStalls) {
		this.totalStalls = totalStalls;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public String getLayoutImageUrl() {
		return layoutImageUrl;
	}

	public void setLayoutImageUrl(String layoutImageUrl) {
		this.layoutImageUrl = layoutImageUrl;
	}

	public String getBannerImageUrl() {
		return bannerImageUrl;
	}

	public void setBannerImageUrl(String bannerImageUrl) {
		this.bannerImageUrl = bannerImageUrl;
	}

	public String getOrganizerName() {
		return organizerName;
	}

	public void setOrganizerName(String organizerName) {
		this.organizerName = organizerName;
	}

	public String getDistrict() {
		return district;
	}

	public void setDistrict(String district) {
		this.district = district;
	}

	public boolean isShowRevenueToExhibitors() {
		return showRevenueToExhibitors;
	}

	public void setShowRevenueToExhibitors(boolean showRevenueToExhibitors) {
		this.showRevenueToExhibitors = showRevenueToExhibitors;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<StallCategoryConfig> getStallCategories() {
		return stallCategories;
	}

	public void setStallCategories(List<StallCategoryConfig> stallCategories) {
		this.stallCategories = stallCategories;
	}

	public List<Stall> getStalls() {
		return stalls;
	}

	public void setStalls(List<Stall> stalls) {
		this.stalls = stalls;
	}

	public List<GalleryImage> getGalleryImages() {
		return galleryImages;
	}

	public void setGalleryImages(List<GalleryImage> galleryImages) {
		this.galleryImages = galleryImages;
	}

	public List<String> getVideoLinks() {
		return videoLinks;
	}

	public void setVideoLinks(List<String> videoLinks) {
		this.videoLinks = videoLinks;
	}

	public Set<User> getAssignedOrganizers() {
		return assignedOrganizers;
	}

	public void setAssignedOrganizers(Set<User> assignedOrganizers) {
		this.assignedOrganizers = assignedOrganizers;
	}

	public StallLayout getStallLayout() {
		return stallLayout;
	}

	public void setStallLayout(StallLayout stallLayout) {
		this.stallLayout = stallLayout;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String name;

    /** Auto-generated on creation. Format: EVT0001, EVT0002 … Never changes after creation. */
    @Column(name = "event_id", unique = true, nullable = false, length = 10)
    private String eventId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 100)
    private String time;

    @Column(nullable = false, length = 500)
    private String venue;

    @Column(name = "total_stalls")
    @Builder.Default
    private int totalStalls = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.UPCOMING;

    @Column(name = "layout_image_url", length = 1000)
    private String layoutImageUrl;

    @Column(name = "banner_image_url", length = 1000)
    private String bannerImageUrl;

    @Column(name = "organizer_name", length = 300)
    private String organizerName;

    @Column(length = 100)
    private String district;

    @Column(name = "show_revenue_to_exhibitors")
    @Builder.Default
    private boolean showRevenueToExhibitors = false;

    @Column(length = 2000)
    private String description;

    @OneToMany(mappedBy = "exhibition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<StallCategoryConfig> stallCategories = new ArrayList<>();

    @OneToMany(mappedBy = "exhibition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Stall> stalls = new ArrayList<>();

    @OneToMany(mappedBy = "exhibition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<GalleryImage> galleryImages = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "exhibition_video_links", joinColumns = @JoinColumn(name = "exhibition_id"))
    @Column(name = "video_url", length = 1000)
    @Builder.Default
    private List<String> videoLinks = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "exhibition_organizers",
        joinColumns = @JoinColumn(name = "exhibition_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> assignedOrganizers = new HashSet<>();

    @OneToOne(mappedBy = "exhibition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private StallLayout stallLayout;

    public enum Status {
        UPCOMING, ONGOING, COMPLETED
    }

    public void recalculateStatus() {
        java.time.LocalDate today = java.time.LocalDate.now();
        if (endDate.isBefore(today)) {
            this.status = Status.COMPLETED;
        } else if (!startDate.isAfter(today)) {
            this.status = Status.ONGOING;
        } else {
            this.status = Status.UPCOMING;
        }
    }
}
