package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.StallCategoryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StallCategoryConfigRepository extends JpaRepository<StallCategoryConfig, Long> {

    List<StallCategoryConfig> findByExhibitionId(Long exhibitionId);

    Optional<StallCategoryConfig> findByExhibitionIdAndCategory(
        Long exhibitionId, StallCategoryConfig.StallCategory category);
}
