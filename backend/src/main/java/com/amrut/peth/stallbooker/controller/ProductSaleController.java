package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateSaleRequest;
import com.amrut.peth.stallbooker.dto.response.ProductSaleDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.ProductSaleService;
import com.amrut.peth.stallbooker.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
@Tag(name = "Sales", description = "Product sales recording")
public class ProductSaleController {

    private final ProductSaleService saleService;
    private final SecurityUtils securityUtils;

    public ProductSaleController(ProductSaleService saleService, SecurityUtils securityUtils) {
        this.saleService = saleService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "List current exhibitor's sales")
    public ResponseEntity<ApiResponse<Page<ProductSaleDto>>> mySales(Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(saleService.getMySales(current.getId(), pageable)));
    }

    @GetMapping("/my/exhibition/{exhibitionId}")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "List sales for a specific exhibition")
    public ResponseEntity<ApiResponse<Page<ProductSaleDto>>> mySalesByExhibition(
        @PathVariable Long exhibitionId, Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
            saleService.getMySalesByExhibition(current.getId(), exhibitionId, pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Record a product sale")
    public ResponseEntity<ApiResponse<ProductSaleDto>> recordSale(@Valid @RequestBody CreateSaleRequest req) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Sale recorded", saleService.recordSale(req, current)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Delete a sale (reverses stock)")
    public ResponseEntity<ApiResponse<Void>> deleteSale(@PathVariable Long id) {
        User current = securityUtils.getCurrentUser();
        saleService.deleteSale(id, current);
        return ResponseEntity.ok(ApiResponse.success("Sale deleted"));
    }
}
