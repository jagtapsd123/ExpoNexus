package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.LandingSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandingSettingsRepository extends JpaRepository<LandingSettings, Long> {

    /** Always only one row in this table (singleton pattern). */
    Optional<LandingSettings> findFirstByOrderByIdAsc();
}
