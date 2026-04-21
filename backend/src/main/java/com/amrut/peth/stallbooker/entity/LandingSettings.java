package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "landing_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingSettings extends BaseEntity {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitleEn() {
		return titleEn;
	}

	public void setTitleEn(String titleEn) {
		this.titleEn = titleEn;
	}

	public String getTitleMr() {
		return titleMr;
	}

	public void setTitleMr(String titleMr) {
		this.titleMr = titleMr;
	}

	public String getSubtitleEn() {
		return subtitleEn;
	}

	public void setSubtitleEn(String subtitleEn) {
		this.subtitleEn = subtitleEn;
	}

	public String getSubtitleMr() {
		return subtitleMr;
	}

	public void setSubtitleMr(String subtitleMr) {
		this.subtitleMr = subtitleMr;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getEcommerceUrl() {
		return ecommerceUrl;
	}

	public void setEcommerceUrl(String ecommerceUrl) {
		this.ecommerceUrl = ecommerceUrl;
	}

	public String getStatExhibitors() {
		return statExhibitors;
	}

	public void setStatExhibitors(String statExhibitors) {
		this.statExhibitors = statExhibitors;
	}

	public String getStatExhibitions() {
		return statExhibitions;
	}

	public void setStatExhibitions(String statExhibitions) {
		this.statExhibitions = statExhibitions;
	}

	public String getStatDistricts() {
		return statDistricts;
	}

	public void setStatDistricts(String statDistricts) {
		this.statDistricts = statDistricts;
	}

	public String getHeroBackgroundUrl() {
		return heroBackgroundUrl;
	}

	public void setHeroBackgroundUrl(String heroBackgroundUrl) {
		this.heroBackgroundUrl = heroBackgroundUrl;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title_en", length = 300)
    @Builder.Default
    private String titleEn = "AMRUT Peth Stall Booking Platform";

    @Column(name = "title_mr", length = 300)
    @Builder.Default
    private String titleMr = "अमृत पेठ स्टॉल बुकिंग प्लॅटफॉर्म";

    @Column(name = "subtitle_en", length = 1000)
    @Builder.Default
    private String subtitleEn = "Manage exhibitions, stalls, and bookings efficiently — all in one place.";

    @Column(name = "subtitle_mr", length = 1000)
    @Builder.Default
    private String subtitleMr = "प्रदर्शने, स्टॉल आणि बुकिंग कार्यक्षमतेने व्यवस्थापित करा — सर्व एकाच ठिकाणी.";

    @Column(length = 3000)
    @Builder.Default
    private String description = "Direct Market Management & Stall Booking System for exhibitions across Maharashtra.";

    @Column(length = 30)
    @Builder.Default
    private String phone = "+91 20 1234 5678";

    @Column(length = 255)
    @Builder.Default
    private String email = "support@amrutpeth.in";

    @Column(length = 500)
    @Builder.Default
    private String address = "Pune, Maharashtra";

    @Column(name = "ecommerce_url", length = 500)
    @Builder.Default
    private String ecommerceUrl = "https://amrutpeth.com/";

    @Column(name = "stat_exhibitors", length = 20)
    @Builder.Default
    private String statExhibitors = "500+";

    @Column(name = "stat_exhibitions", length = 20)
    @Builder.Default
    private String statExhibitions = "50+";

    @Column(name = "stat_districts", length = 20)
    @Builder.Default
    private String statDistricts = "36";

    @Column(name = "hero_background_url", length = 1000)
    @Builder.Default
    private String heroBackgroundUrl = "";
}
