package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.entity.District;
import com.amrut.peth.stallbooker.repository.DistrictRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/districts")
@Tag(name = "Districts", description = "District lookup")
public class DistrictController {

    private final DistrictRepository districtRepository;

    public DistrictController(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    @GetMapping
    @Operation(summary = "List all districts sorted by name")
    public ResponseEntity<ApiResponse<List<District>>> list() {
        return ResponseEntity.ok(ApiResponse.success(districtRepository.findAllByOrderByDistrictNameAsc()));
    }
}
