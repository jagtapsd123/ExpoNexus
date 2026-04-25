package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.ProductSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSaleRepository extends JpaRepository<ProductSale, Long> {

    Page<ProductSale> findByExhibitorIdOrderBySoldAtDesc(Long exhibitorId, Pageable pageable);

    Page<ProductSale> findByExhibitorIdAndExhibitionIdOrderBySoldAtDesc(Long exhibitorId, Long exhibitionId, Pageable pageable);

    @Query("SELECT SUM(s.total) FROM ProductSale s WHERE s.exhibitor.id = :exhibitorId")
    Double sumTotalByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT SUM(s.total) FROM ProductSale s WHERE s.exhibitor.id = :exhibitorId AND s.exhibition.id = :exhibitionId")
    Double sumTotalByExhibitorAndExhibition(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId);

    @Query("SELECT SUM(s.quantity) FROM ProductSale s WHERE s.exhibitor.id = :exhibitorId AND s.exhibition.id = :exhibitionId")
    Long sumQtyByExhibitorAndExhibition(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId);

    // Monthly sales: returns [year, month, total]
    @Query("SELECT YEAR(s.soldAt), MONTH(s.soldAt), SUM(s.total) FROM ProductSale s WHERE s.exhibitor.id = :exhibitorId GROUP BY YEAR(s.soldAt), MONTH(s.soldAt) ORDER BY YEAR(s.soldAt), MONTH(s.soldAt)")
    List<Object[]> findMonthlySalesByExhibitor(@Param("exhibitorId") Long exhibitorId);

    // Top products by revenue: returns [productName, totalRevenue]
    @Query("SELECT s.product.name, SUM(s.total) FROM ProductSale s WHERE s.exhibitor.id = :exhibitorId GROUP BY s.product.id, s.product.name ORDER BY SUM(s.total) DESC")
    List<Object[]> findTopProductsByExhibitor(@Param("exhibitorId") Long exhibitorId, Pageable pageable);

    // Exhibition revenue series: returns [exhibitionName, total]
    @Query("SELECT s.exhibition.name, SUM(s.total) FROM ProductSale s WHERE s.exhibitor.id = :exhibitorId GROUP BY s.exhibition.id, s.exhibition.name")
    List<Object[]> findRevenueByExhibition(@Param("exhibitorId") Long exhibitorId);
}
