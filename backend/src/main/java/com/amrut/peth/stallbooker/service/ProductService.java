package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateProductRequest;
import com.amrut.peth.stallbooker.dto.response.ProductDto;
import com.amrut.peth.stallbooker.entity.Product;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ForbiddenException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getMyProducts(Long exhibitorId, Pageable pageable) {
        return productRepository.findByExhibitorIdAndActiveTrue(exhibitorId, pageable)
            .map(ProductDto::from);
    }

    @Transactional
    public ProductDto create(CreateProductRequest req, User exhibitor) {
        Product product = new Product();
        product.setExhibitor(exhibitor);
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setStockStatus(parseStockStatus(req.getStockStatus()));
        product.setActive(true);
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public ProductDto update(Long id, CreateProductRequest req, User exhibitor) {
        Product product = findOrThrow(id);
        ensureOwner(product, exhibitor);
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setStockStatus(parseStockStatus(req.getStockStatus()));
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateStockStatus(Long id, String stockStatus, User exhibitor) {
        Product product = findOrThrow(id);
        ensureOwner(product, exhibitor);
        product.setStockStatus(parseStockStatus(stockStatus));
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id, User exhibitor) {
        Product product = findOrThrow(id);
        ensureOwner(product, exhibitor);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product findOrThrow(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private void ensureOwner(Product product, User user) {
        if (!product.getExhibitor().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only manage your own products");
        }
    }

    private Product.StockStatus parseStockStatus(String value) {
        try {
            return Product.StockStatus.valueOf(
                value != null ? value.toUpperCase() : "IN_STOCK");
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid stock status: " + value);
        }
    }
}
