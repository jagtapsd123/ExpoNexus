package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findAllByOrderByDistrictNameAsc();
}
