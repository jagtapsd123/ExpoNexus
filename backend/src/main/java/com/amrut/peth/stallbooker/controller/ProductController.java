package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateProductRequest;
import com.amrut.peth.stallbooker.dto.response.ProductDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.ProductService;
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
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Exhibitor product catalogue")
public class ProductController {

    private final ProductService productService;
    private final SecurityUtils securityUtils;

    public ProductController(ProductService productService, SecurityUtils securityUtils) {
        this.productService = productService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "List current exhibitor's products")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> myProducts(Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(productService.getMyProducts(current.getId(), pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductDto>> create(@Valid @RequestBody CreateProductRequest req) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Product created", productService.create(req, current)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Update a product")
    public ResponseEntity<ApiResponse<ProductDto>> update(
        @PathVariable Long id,
        @Valid @RequestBody CreateProductRequest req) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.update(id, req, current)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Soft-delete a product")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User current = securityUtils.getCurrentUser();
        productService.delete(id, current);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }
}
