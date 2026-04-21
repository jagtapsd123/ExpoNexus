package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Page<Complaint> findByExhibitorId(Long exhibitorId, Pageable pageable);

    Page<Complaint> findByExhibitionId(Long exhibitionId, Pageable pageable);

    Page<Complaint> findByStatus(Complaint.ComplaintStatus status, Pageable pageable);

    long countByStatus(Complaint.ComplaintStatus status);
}
