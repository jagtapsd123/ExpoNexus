package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.response.BeneficiaryDto;
import com.amrut.peth.stallbooker.service.BeneficiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/beneficiaries")
@RequiredArgsConstructor
@Tag(name = "Beneficiaries", description = "Beneficiary management")
public class BeneficiaryController {

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
		super();
		this.beneficiaryService = beneficiaryService;
	}

	private final BeneficiaryService beneficiaryService;

    @GetMapping
    @Operation(summary = "List beneficiaries with optional search and pagination")
    public ResponseEntity<ApiResponse<Page<BeneficiaryDto>>> list(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(beneficiaryService.getAll(search, pageable)));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import beneficiaries from Excel file (.xlsx or .xls)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importExcel(
            @RequestParam("file") MultipartFile file) {
        Map<String, Object> result = beneficiaryService.importFromExcel(file);
        return ResponseEntity.ok(ApiResponse.success("Import complete", result));
    }
}
