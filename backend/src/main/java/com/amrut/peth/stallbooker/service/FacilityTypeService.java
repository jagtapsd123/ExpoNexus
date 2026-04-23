package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateFacilityTypeRequest;
import com.amrut.peth.stallbooker.dto.response.FacilityTypeDto;
import com.amrut.peth.stallbooker.entity.FacilityType;
import com.amrut.peth.stallbooker.entity.Stall;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.FacilityTypeRepository;
import com.amrut.peth.stallbooker.repository.StallRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class FacilityTypeService {

    private final FacilityTypeRepository facilityTypeRepository;
    private final StallRepository stallRepository;

    public FacilityTypeService(FacilityTypeRepository facilityTypeRepository, StallRepository stallRepository) {
        this.facilityTypeRepository = facilityTypeRepository;
        this.stallRepository = stallRepository;
    }

    @Transactional(readOnly = true)
    public List<FacilityTypeDto> getAll() {
        return facilityTypeRepository.findAll().stream().map(FacilityTypeDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FacilityTypeDto> getActive() {
        return facilityTypeRepository.findByActiveTrueOrderByName().stream().map(FacilityTypeDto::from).toList();
    }

    @Transactional
    public FacilityTypeDto create(CreateFacilityTypeRequest req) {
        if (facilityTypeRepository.existsByNameIgnoreCase(req.getName())) {
            throw new BadRequestException("Facility type '" + req.getName() + "' already exists");
        }
        FacilityType ft = new FacilityType();
        ft.setName(req.getName());
        ft.setIcon(req.getIcon() != null && !req.getIcon().isBlank() ? req.getIcon() : "\u26A1");
        ft.setDescription(req.getDescription());
        ft.setActive(req.isActive());
        return FacilityTypeDto.from(facilityTypeRepository.save(ft));
    }

    @Transactional
    public FacilityTypeDto update(Long id, CreateFacilityTypeRequest req) {
        FacilityType ft = findOrThrow(id);
        if (facilityTypeRepository.existsByNameIgnoreCaseAndIdNot(req.getName(), id)) {
            throw new BadRequestException("Facility type '" + req.getName() + "' already exists");
        }
        ft.setName(req.getName());
        ft.setIcon(req.getIcon() != null && !req.getIcon().isBlank() ? req.getIcon() : ft.getIcon());
        ft.setDescription(req.getDescription());
        ft.setActive(req.isActive());
        return FacilityTypeDto.from(facilityTypeRepository.save(ft));
    }

    @Transactional
    public void delete(Long id) {
        FacilityType ft = findOrThrow(id);
        facilityTypeRepository.delete(ft);
    }

    @Transactional
    public List<FacilityTypeDto> assignToStall(Long stallId, List<Long> facilityIds) {
        Stall stall = stallRepository.findById(stallId)
            .orElseThrow(() -> new ResourceNotFoundException("Stall", stallId));
        List<Long> requestedIds = facilityIds == null ? List.of() : facilityIds;
        Set<FacilityType> facilities = new HashSet<>(facilityTypeRepository.findAllById(requestedIds));
        if (facilities.size() != requestedIds.size()) {
            throw new BadRequestException("One or more facility types were not found");
        }
        stall.setFacilities(facilities);
        stallRepository.save(stall);
        return facilities.stream().map(FacilityTypeDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FacilityTypeDto> getForStall(Long stallId) {
        Stall stall = stallRepository.findById(stallId)
            .orElseThrow(() -> new ResourceNotFoundException("Stall", stallId));
        return stall.getFacilities().stream().map(FacilityTypeDto::from).toList();
    }

    private FacilityType findOrThrow(Long id) {
        return facilityTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FacilityType", id));
    }
}
