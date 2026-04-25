package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByExhibitorIdAndActiveTrue(Long exhibitorId, Pageable pageable);

    long countByExhibitorIdAndActiveTrue(Long exhibitorId);

    long countByExhibitorIdAndExhibitionIdAndActiveTrue(Long exhibitorId, Long exhibitionId);

    List<Product> findByExhibitorIdAndActiveTrueOrderBySoldQuantityDesc(Long exhibitorId, Pageable pageable);

    List<Product> findByExhibitorIdAndExhibitionIdAndActiveTrueOrderBySoldQuantityDesc(Long exhibitorId, Long exhibitionId, Pageable pageable);

    // ─── Revenue & Profit aggregates ───────────────────────────────────────────

    @Query("SELECT SUM(p.price * p.soldQuantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.active = true")
    Double sumRevenueByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT SUM(p.costPrice * p.soldQuantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.active = true")
    Double sumProductCostByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT SUM(p.soldQuantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.active = true")
    Long sumSoldQtyByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT SUM(p.quantity - p.soldQuantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.active = true")
    Long sumRemainingQtyByExhibitor(@Param("exhibitorId") Long exhibitorId);

    // ─── Exhibition-scoped aggregates ──────────────────────────────────────────

    @Query("SELECT SUM(p.price * p.soldQuantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.exhibition.id = :exhibitionId AND p.active = true")
    Double sumRevenueByExhibitorAndExhibition(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId);

    @Query("SELECT SUM(p.costPrice * p.soldQuantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.exhibition.id = :exhibitionId AND p.active = true")
    Double sumProductCostByExhibitorAndExhibition(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId);

    @Query("SELECT SUM(p.quantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.exhibition.id = :exhibitionId AND p.active = true")
    Long sumQuantityByExhibitorAndExhibition(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId);

    @Query("SELECT SUM(p.soldQuantity) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.exhibition.id = :exhibitionId AND p.active = true")
    Long sumSoldQtyByExhibitorAndExhibition(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId);

    // ─── Low-stock alerts ──────────────────────────────────────────────────────

    @Query("SELECT p FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.active = true AND p.soldQuantity >= p.quantity")
    List<Product> findOutOfStockByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.active = true AND p.soldQuantity >= p.quantity")
    long countOutOfStockByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.exhibitor.id = :exhibitorId AND p.active = true AND p.soldQuantity < p.quantity AND (p.quantity - p.soldQuantity) <= (p.quantity * 0.2)")
    long countLowStockByExhibitor(@Param("exhibitorId") Long exhibitorId);
}
