package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.StallLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StallLayoutRepository extends JpaRepository<StallLayout, Long> {

    Optional<StallLayout> findByExhibitionId(Long exhibitionId);

    boolean existsByExhibitionId(Long exhibitionId);

    void deleteByExhibitionId(Long exhibitionId);
}
