package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateLandingSettingsRequest {
	@Size(max = 300) private String titleEn;
    @Size(max = 300) private String titleMr;
    @Size(max = 1000) private String subtitleEn;
    @Size(max = 1000) private String subtitleMr;
    @Size(max = 3000) private String description;

    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 500) private String address;
    @Size(max = 500) private String ecommerceUrl;

    private String statExhibitors;
    private String statExhibitions;
    private String statDistricts;

    @Size(max = 1000) private String heroBackgroundUrl;
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


}
