package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.UpdateLandingSettingsRequest;
import com.amrut.peth.stallbooker.dto.response.LandingSettingsDto;
import com.amrut.peth.stallbooker.entity.GalleryImage;
import com.amrut.peth.stallbooker.entity.LandingSettings;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.GalleryImageRepository;
import com.amrut.peth.stallbooker.repository.LandingSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LandingService {

    private final LandingSettingsRepository settingsRepository;
    private final GalleryImageRepository galleryImageRepository;

    public LandingService(LandingSettingsRepository settingsRepository, GalleryImageRepository galleryImageRepository) {
		super();
		this.settingsRepository = settingsRepository;
		this.galleryImageRepository = galleryImageRepository;
	}

	@Transactional(readOnly = true)
    public LandingSettingsDto getSettings() {
        LandingSettings settings = getOrCreate();
        List<String> galleryUrls = galleryImageRepository
            .findByImageTypeOrderBySortOrderAsc(GalleryImage.ImageType.LANDING)
            .stream().map(GalleryImage::getImageUrl).toList();
        LandingSettingsDto dto = LandingSettingsDto.from(settings);
        dto.setGalleryImageUrls(galleryUrls);
        return dto;
    }

    @Transactional
    public LandingSettingsDto updateSettings(UpdateLandingSettingsRequest req) {
        LandingSettings settings = getOrCreate();
        if (req.getTitleEn() != null) settings.setTitleEn(req.getTitleEn());
        if (req.getTitleMr() != null) settings.setTitleMr(req.getTitleMr());
        if (req.getSubtitleEn() != null) settings.setSubtitleEn(req.getSubtitleEn());
        if (req.getSubtitleMr() != null) settings.setSubtitleMr(req.getSubtitleMr());
        if (req.getDescription() != null) settings.setDescription(req.getDescription());
        if (req.getPhone() != null) settings.setPhone(req.getPhone());
        if (req.getEmail() != null) settings.setEmail(req.getEmail());
        if (req.getAddress() != null) settings.setAddress(req.getAddress());
        if (req.getEcommerceUrl() != null) settings.setEcommerceUrl(req.getEcommerceUrl());
        if (req.getStatExhibitors() != null) settings.setStatExhibitors(req.getStatExhibitors());
        if (req.getStatExhibitions() != null) settings.setStatExhibitions(req.getStatExhibitions());
        if (req.getStatDistricts() != null) settings.setStatDistricts(req.getStatDistricts());
        if (req.getHeroBackgroundUrl() != null) settings.setHeroBackgroundUrl(req.getHeroBackgroundUrl());
        return LandingSettingsDto.from(settingsRepository.save(settings));
    }

    @Transactional
    public GalleryImage addGalleryImage(String imageUrl) {
        long count = galleryImageRepository.findByImageTypeOrderBySortOrderAsc(GalleryImage.ImageType.LANDING).size();
        GalleryImage image = new GalleryImage();

        image.setImageUrl(imageUrl);
        image.setImageType(GalleryImage.ImageType.LANDING);
        image.setSortOrder((int) count);
        return galleryImageRepository.save(image);
    }

    @Transactional
    public void deleteGalleryImage(Long id) {
        GalleryImage image = galleryImageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gallery image", id));
        galleryImageRepository.delete(image);
    }

    @Transactional(readOnly = true)
    public List<String> getGalleryUrls() {
        return galleryImageRepository
            .findByImageTypeOrderBySortOrderAsc(GalleryImage.ImageType.LANDING)
            .stream().map(GalleryImage::getImageUrl).toList();
    }

    private LandingSettings getOrCreate() {
    	return settingsRepository.findFirstByOrderByIdAsc()
    		    .orElseGet(() -> {
    		        LandingSettings settings = new LandingSettings();
    		        return settingsRepository.save(settings);
    		    });
    }
}
