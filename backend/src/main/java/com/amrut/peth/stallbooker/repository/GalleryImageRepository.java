package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {

    List<GalleryImage> findByExhibitionIdOrderBySortOrderAsc(Long exhibitionId);

    List<GalleryImage> findByImageTypeOrderBySortOrderAsc(GalleryImage.ImageType imageType);

    void deleteByExhibitionId(Long exhibitionId);
}
