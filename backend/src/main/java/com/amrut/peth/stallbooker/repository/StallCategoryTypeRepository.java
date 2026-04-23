package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.StallCategoryType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StallCategoryTypeRepository extends JpaRepository<StallCategoryType, Long> {

    @Override
    @EntityGraph(attributePaths = "facilities")
    List<StallCategoryType> findAll();

    @Override
    @EntityGraph(attributePaths = "facilities")
    Optional<StallCategoryType> findById(Long id);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
