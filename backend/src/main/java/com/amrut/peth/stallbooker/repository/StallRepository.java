package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Stall;
import com.amrut.peth.stallbooker.entity.StallCategoryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StallRepository extends JpaRepository<Stall, Long> {

    List<Stall> findByExhibitionId(Long exhibitionId);

    List<Stall> findByExhibitionIdAndStatus(Long exhibitionId, Stall.StallStatus status);

    List<Stall> findByExhibitionIdAndCategory(Long exhibitionId, StallCategoryConfig.StallCategory category);

    Optional<Stall> findByExhibitionIdAndNumber(Long exhibitionId, String number);

    boolean existsByExhibitionIdAndNumber(Long exhibitionId, String number);

    long countByExhibitionIdAndStatus(Long exhibitionId, Stall.StallStatus status);

    long countByExhibitionId(Long exhibitionId);

    @Query("SELECT SUM(s.price) FROM Stall s WHERE s.exhibition.id = :exhibitionId AND s.status = 'BOOKED'")
    Double sumRevenueByExhibitionId(@Param("exhibitionId") Long exhibitionId);
}
