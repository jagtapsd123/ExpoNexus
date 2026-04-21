package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Exhibition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExhibitionRepository extends JpaRepository<Exhibition, Long> {

    List<Exhibition> findByStatus(Exhibition.Status status);

    Page<Exhibition> findByStatus(Exhibition.Status status, Pageable pageable);

    @Query("""
        SELECT e FROM Exhibition e
        WHERE (:status IS NULL OR e.status = :status)
          AND (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(e.venue) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY e.startDate DESC
        """)
    Page<Exhibition> searchExhibitions(
        @Param("status") Exhibition.Status status,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("""
        SELECT e FROM Exhibition e
        JOIN e.assignedOrganizers o
        WHERE o.id = :organizerId
          AND (:status IS NULL OR e.status = :status)
        ORDER BY e.startDate DESC
        """)
    List<Exhibition> findByAssignedOrganizer(
        @Param("organizerId") Long organizerId,
        @Param("status") Exhibition.Status status
    );

    long countByStatus(Exhibition.Status status);
}
