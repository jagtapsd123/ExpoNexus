package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.FacilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityTypeRepository extends JpaRepository<FacilityType, Long> {
    List<FacilityType> findByActiveTrueOrderByName();
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
