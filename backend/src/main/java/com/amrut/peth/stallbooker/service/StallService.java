package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateStallRequest;
import com.amrut.peth.stallbooker.dto.response.StallDto;
import com.amrut.peth.stallbooker.entity.*;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import com.amrut.peth.stallbooker.repository.StallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StallService {

    private final StallRepository stallRepository;
    private final ExhibitionRepository exhibitionRepository;

    public StallService(StallRepository stallRepository, ExhibitionRepository exhibitionRepository) {
		super();
		this.stallRepository = stallRepository;
		this.exhibitionRepository = exhibitionRepository;
	}

	@Transactional(readOnly = true)
    public List<StallDto> getByExhibition(Long exhibitionId) {
        return stallRepository.findByExhibitionId(exhibitionId)
            .stream().map(StallDto::from).toList();
    }

    @Transactional(readOnly = true)
    public StallDto getById(Long id) {
        return StallDto.from(findOrThrow(id));
    }

    @Transactional
    public StallDto create(CreateStallRequest req) {
        Exhibition exhibition = exhibitionRepository.findById(req.getExhibitionId())
            .orElseThrow(() -> new ResourceNotFoundException("Exhibition", req.getExhibitionId()));

        if (stallRepository.existsByExhibitionIdAndNumber(req.getExhibitionId(), req.getNumber())) {
            throw new BadRequestException("Stall number '" + req.getNumber() + "' already exists in this exhibition");
        }

        StallCategoryConfig.StallCategory category =
            StallCategoryConfig.StallCategory.valueOf(req.getCategory().toUpperCase());

        Stall stall = new Stall();

        stall.setExhibition(exhibition);
        stall.setNumber(req.getNumber());
        stall.setCategory(category);
        stall.setPrice(req.getPrice());
        stall.setSize(req.getSize());
        stall.setDescription(req.getDescription());
        stall.setActive(req.isActive());

        stall.setStatus(
            req.isActive()
                ? Stall.StallStatus.AVAILABLE
                : Stall.StallStatus.UNAVAILABLE
        );

        return StallDto.from(stallRepository.save(stall));
    }

    @Transactional
    public StallDto updateStatus(Long id, Stall.StallStatus status) {
        Stall stall = findOrThrow(id);
        stall.setStatus(status);
        stall.setActive(status != Stall.StallStatus.UNAVAILABLE && status != Stall.StallStatus.BLOCKED);
        return StallDto.from(stallRepository.save(stall));
    }

    @Transactional
    public void delete(Long id) {
        Stall stall = findOrThrow(id);
        if (stall.getStatus() == Stall.StallStatus.BOOKED) {
            throw new BadRequestException("Cannot delete a booked stall");
        }
        stallRepository.delete(stall);
    }

    private Stall findOrThrow(Long id) {
        return stallRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Stall", id));
    }
}
