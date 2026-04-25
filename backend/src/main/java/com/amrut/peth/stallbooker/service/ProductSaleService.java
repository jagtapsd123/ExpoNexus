package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateSaleRequest;
import com.amrut.peth.stallbooker.dto.response.ProductSaleDto;
import com.amrut.peth.stallbooker.entity.Exhibition;
import com.amrut.peth.stallbooker.entity.Product;
import com.amrut.peth.stallbooker.entity.ProductSale;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ForbiddenException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import com.amrut.peth.stallbooker.repository.ProductSaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ProductSaleService {

    private final ProductSaleRepository saleRepository;
    private final ProductService productService;
    private final ExhibitionRepository exhibitionRepository;

    public ProductSaleService(ProductSaleRepository saleRepository,
                              ProductService productService,
                              ExhibitionRepository exhibitionRepository) {
        this.saleRepository = saleRepository;
        this.productService = productService;
        this.exhibitionRepository = exhibitionRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductSaleDto> getMySales(Long exhibitorId, Pageable pageable) {
        return saleRepository.findByExhibitorIdOrderBySoldAtDesc(exhibitorId, pageable)
            .map(ProductSaleDto::from);
    }

    @Transactional(readOnly = true)
    public Page<ProductSaleDto> getMySalesByExhibition(Long exhibitorId, Long exhibitionId, Pageable pageable) {
        return saleRepository.findByExhibitorIdAndExhibitionIdOrderBySoldAtDesc(exhibitorId, exhibitionId, pageable)
            .map(ProductSaleDto::from);
    }

    @Transactional
    public ProductSaleDto recordSale(CreateSaleRequest req, User exhibitor) {
        Product product = productService.findOrThrow(req.getProductId());
        if (!product.getExhibitor().getId().equals(exhibitor.getId())) {
            throw new ForbiddenException("You can only sell your own products");
        }
        if (product.getRemainingQuantity() < req.getQuantity()) {
            throw new BadRequestException(
                "Insufficient stock. Available: " + product.getRemainingQuantity());
        }

        Exhibition exhibition = exhibitionRepository.findById(req.getExhibitionId())
            .orElseThrow(() -> new ResourceNotFoundException("Exhibition", req.getExhibitionId()));

        ProductSale sale = new ProductSale();
        sale.setExhibitor(exhibitor);
        sale.setExhibition(exhibition);
        sale.setProduct(product);
        sale.setQuantity(req.getQuantity());
        sale.setUnitPrice(product.getPrice());
        sale.setTotal(product.getPrice() * req.getQuantity());
        sale.setPaymentMode(req.getPaymentMode() != null ? req.getPaymentMode() : "CASH");
        sale.setNote(req.getNote());
        sale.setSoldAt(LocalDateTime.now());

        saleRepository.save(sale);
        productService.incrementSoldQuantity(product, req.getQuantity());

        return ProductSaleDto.from(sale);
    }

    @Transactional
    public void deleteSale(Long saleId, User exhibitor) {
        ProductSale sale = saleRepository.findById(saleId)
            .orElseThrow(() -> new ResourceNotFoundException("Sale", saleId));
        if (!sale.getExhibitor().getId().equals(exhibitor.getId())) {
            throw new ForbiddenException("You can only delete your own sales");
        }
        productService.decrementSoldQuantity(sale.getProduct(), sale.getQuantity());
        saleRepository.delete(sale);
    }
}
