package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateProductRequest;
import com.amrut.peth.stallbooker.dto.response.ProductDto;
import com.amrut.peth.stallbooker.entity.Exhibition;
import com.amrut.peth.stallbooker.entity.Product;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.ForbiddenException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import com.amrut.peth.stallbooker.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ExhibitionRepository exhibitionRepository;

    public ProductService(ProductRepository productRepository, ExhibitionRepository exhibitionRepository) {
        this.productRepository = productRepository;
        this.exhibitionRepository = exhibitionRepository;
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
        applyRequest(product, req);
        product.setActive(true);
        product.setStockStatus(product.computeStockStatus());
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public ProductDto update(Long id, CreateProductRequest req, User exhibitor) {
        Product product = findOrThrow(id);
        ensureOwner(product, exhibitor);
        applyRequest(product, req);
        product.setStockStatus(product.computeStockStatus());
        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id, User exhibitor) {
        Product product = findOrThrow(id);
        ensureOwner(product, exhibitor);
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void incrementSoldQuantity(Product product, int qty) {
        product.setSoldQuantity(product.getSoldQuantity() + qty);
        product.setStockStatus(product.computeStockStatus());
        productRepository.save(product);
    }

    @Transactional
    public void decrementSoldQuantity(Product product, int qty) {
        int newQty = Math.max(0, product.getSoldQuantity() - qty);
        product.setSoldQuantity(newQty);
        product.setStockStatus(product.computeStockStatus());
        productRepository.save(product);
    }

    public Product findOrThrow(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private void applyRequest(Product product, CreateProductRequest req) {
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setCostPrice(req.getCostPrice());
        product.setQuantity(req.getQuantity());
        product.setCategory(req.getCategory());
        product.setSku(req.getSku());
        if (req.getExhibitionId() != null) {
            Exhibition ex = exhibitionRepository.findById(req.getExhibitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Exhibition", req.getExhibitionId()));
            product.setExhibition(ex);
        } else {
            product.setExhibition(null);
        }
    }

    private void ensureOwner(Product product, User user) {
        if (!product.getExhibitor().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only manage your own products");
        }
    }
}
