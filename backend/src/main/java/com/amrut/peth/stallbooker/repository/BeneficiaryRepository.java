package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Beneficiary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    @Query("SELECT b FROM Beneficiary b WHERE " +
           "LOWER(b.name)         LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.mobile)       LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.businessName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.category)     LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Beneficiary> searchByText(@Param("search") String search, Pageable pageable);

    boolean existsByBeneficiaryCode(String beneficiaryCode);
}
