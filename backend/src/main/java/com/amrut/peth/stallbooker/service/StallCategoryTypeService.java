package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateStallCategoryTypeRequest;
import com.amrut.peth.stallbooker.dto.response.StallCategoryTypeDto;
import com.amrut.peth.stallbooker.entity.FacilityType;
import com.amrut.peth.stallbooker.entity.StallCategoryType;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.FacilityTypeRepository;
import com.amrut.peth.stallbooker.repository.StallCategoryTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class StallCategoryTypeService {

    private final StallCategoryTypeRepository stallCategoryTypeRepository;
    private final FacilityTypeRepository facilityTypeRepository;

    public StallCategoryTypeService(
        StallCategoryTypeRepository stallCategoryTypeRepository,
        FacilityTypeRepository facilityTypeRepository
    ) {
        this.stallCategoryTypeRepository = stallCategoryTypeRepository;
        this.facilityTypeRepository = facilityTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<StallCategoryTypeDto> getAll() {
        return stallCategoryTypeRepository.findAll().stream().map(StallCategoryTypeDto::from).toList();
    }

    @Transactional
    public StallCategoryTypeDto create(CreateStallCategoryTypeRequest req) {
        if (stallCategoryTypeRepository.existsByNameIgnoreCase(req.getName())) {
            throw new BadRequestException("Stall category '" + req.getName() + "' already exists");
        }
        StallCategoryType category = new StallCategoryType();
        category.setName(req.getName().trim());
        category.setDescription(req.getDescription());
        category.setActive(req.isActive());
        return StallCategoryTypeDto.from(stallCategoryTypeRepository.save(category));
    }

    @Transactional
    public StallCategoryTypeDto update(Long id, CreateStallCategoryTypeRequest req) {
        StallCategoryType category = findOrThrow(id);
        if (stallCategoryTypeRepository.existsByNameIgnoreCaseAndIdNot(req.getName(), id)) {
            throw new BadRequestException("Stall category '" + req.getName() + "' already exists");
        }
        category.setName(req.getName().trim());
        category.setDescription(req.getDescription());
        category.setActive(req.isActive());
        return StallCategoryTypeDto.from(stallCategoryTypeRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        stallCategoryTypeRepository.delete(findOrThrow(id));
    }

    @Transactional
    public StallCategoryTypeDto assignFacilities(Long id, List<Long> facilityIds) {
        StallCategoryType category = findOrThrow(id);
        List<Long> requestedIds = facilityIds == null ? List.of() : facilityIds;
        Set<FacilityType> facilities = new HashSet<>(facilityTypeRepository.findAllById(requestedIds));
        if (facilities.size() != requestedIds.size()) {
            throw new BadRequestException("One or more facility types were not found");
        }
        category.setFacilities(facilities);
        return StallCategoryTypeDto.from(stallCategoryTypeRepository.save(category));
    }

    private StallCategoryType findOrThrow(Long id) {
        return stallCategoryTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("StallCategoryType", id));
    }
}
