package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByExhibitorIdAndActiveTrue(Long exhibitorId, Pageable pageable);
    long countByExhibitorIdAndActiveTrue(Long exhibitorId);
}
