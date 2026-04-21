package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.FacilityRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRequestRepository extends JpaRepository<FacilityRequest, Long> {

    List<FacilityRequest> findByExhibitorId(Long exhibitorId);

    Page<FacilityRequest> findByExhibitorId(Long exhibitorId, Pageable pageable);

    Page<FacilityRequest> findByExhibitionId(Long exhibitionId, Pageable pageable);

    Page<FacilityRequest> findByStatus(FacilityRequest.FacilityStatus status, Pageable pageable);

    long countByStatus(FacilityRequest.FacilityStatus status);
}
