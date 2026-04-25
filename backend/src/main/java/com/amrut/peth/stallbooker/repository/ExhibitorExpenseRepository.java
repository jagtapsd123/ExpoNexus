package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.ExhibitorExpense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExhibitorExpenseRepository extends JpaRepository<ExhibitorExpense, Long> {

    Page<ExhibitorExpense> findByExhibitorIdOrderByExpenseDateDesc(Long exhibitorId, Pageable pageable);

    Page<ExhibitorExpense> findByExhibitorIdAndExhibitionIdOrderByExpenseDateDesc(Long exhibitorId, Long exhibitionId, Pageable pageable);

    @Query("SELECT SUM(e.amount) FROM ExhibitorExpense e WHERE e.exhibitor.id = :exhibitorId")
    Double sumByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT SUM(e.amount) FROM ExhibitorExpense e WHERE e.exhibitor.id = :exhibitorId AND e.exhibition.id = :exhibitionId")
    Double sumByExhibitorAndExhibition(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId);

    @Query("SELECT SUM(e.amount) FROM ExhibitorExpense e WHERE e.exhibitor.id = :exhibitorId AND e.type = :type")
    Double sumByExhibitorAndType(@Param("exhibitorId") Long exhibitorId, @Param("type") String type);

    @Query("SELECT SUM(e.amount) FROM ExhibitorExpense e WHERE e.exhibitor.id = :exhibitorId AND e.exhibition.id = :exhibitionId AND e.type = :type")
    Double sumByExhibitorAndExhibitionAndType(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId, @Param("type") String type);

    @Query("SELECT SUM(e.amount) FROM ExhibitorExpense e WHERE e.exhibitor.id = :exhibitorId AND e.type <> :excludeType")
    Double sumByExhibitorExcludingType(@Param("exhibitorId") Long exhibitorId, @Param("excludeType") String excludeType);

    @Query("SELECT SUM(e.amount) FROM ExhibitorExpense e WHERE e.exhibitor.id = :exhibitorId AND e.exhibition.id = :exhibitionId AND e.type <> :excludeType")
    Double sumByExhibitorAndExhibitionExcludingType(@Param("exhibitorId") Long exhibitorId, @Param("exhibitionId") Long exhibitionId, @Param("excludeType") String excludeType);

    java.util.Optional<ExhibitorExpense> findByBookingId(Long bookingId);
}
