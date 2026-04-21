package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.LandingSettings;

import java.util.List;

public class LandingSettingsDto {

    private String titleEn;
    private String titleMr;
    private String subtitleEn;
    private String subtitleMr;
    private String description;
    private String phone;
    private String email;
    private String address;
    private String ecommerceUrl;
    private String statExhibitors;
    private String statExhibitions;
    private String statDistricts;
    private String heroBackgroundUrl;
    private List<String> galleryImageUrls;

    public LandingSettingsDto() {}

    public String getTitleEn() { return titleEn; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }

    public String getTitleMr() { return titleMr; }
    public void setTitleMr(String titleMr) { this.titleMr = titleMr; }

    public String getSubtitleEn() { return subtitleEn; }
    public void setSubtitleEn(String subtitleEn) { this.subtitleEn = subtitleEn; }

    public String getSubtitleMr() { return subtitleMr; }
    public void setSubtitleMr(String subtitleMr) { this.subtitleMr = subtitleMr; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEcommerceUrl() { return ecommerceUrl; }
    public void setEcommerceUrl(String ecommerceUrl) { this.ecommerceUrl = ecommerceUrl; }

    public String getStatExhibitors() { return statExhibitors; }
    public void setStatExhibitors(String statExhibitors) { this.statExhibitors = statExhibitors; }

    public String getStatExhibitions() { return statExhibitions; }
    public void setStatExhibitions(String statExhibitions) { this.statExhibitions = statExhibitions; }

    public String getStatDistricts() { return statDistricts; }
    public void setStatDistricts(String statDistricts) { this.statDistricts = statDistricts; }

    public String getHeroBackgroundUrl() { return heroBackgroundUrl; }
    public void setHeroBackgroundUrl(String heroBackgroundUrl) { this.heroBackgroundUrl = heroBackgroundUrl; }

    public List<String> getGalleryImageUrls() { return galleryImageUrls; }
    public void setGalleryImageUrls(List<String> galleryImageUrls) { this.galleryImageUrls = galleryImageUrls; }

    public static LandingSettingsDto from(LandingSettings s) {
        LandingSettingsDto dto = new LandingSettingsDto();
        dto.titleEn = s.getTitleEn();
        dto.titleMr = s.getTitleMr();
        dto.subtitleEn = s.getSubtitleEn();
        dto.subtitleMr = s.getSubtitleMr();
        dto.description = s.getDescription();
        dto.phone = s.getPhone();
        dto.email = s.getEmail();
        dto.address = s.getAddress();
        dto.ecommerceUrl = s.getEcommerceUrl();
        dto.statExhibitors = s.getStatExhibitors();
        dto.statExhibitions = s.getStatExhibitions();
        dto.statDistricts = s.getStatDistricts();
        dto.heroBackgroundUrl = s.getHeroBackgroundUrl();
        return dto;
    }
}
