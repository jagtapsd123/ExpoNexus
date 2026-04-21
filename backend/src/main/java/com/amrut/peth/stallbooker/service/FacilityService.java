package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateFacilityRequest;
import com.amrut.peth.stallbooker.dto.response.FacilityRequestDto;
import com.amrut.peth.stallbooker.entity.Exhibition;
import com.amrut.peth.stallbooker.entity.FacilityRequest;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import com.amrut.peth.stallbooker.repository.FacilityRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRequestRepository facilityRequestRepository;
    private final ExhibitionRepository exhibitionRepository;

    public FacilityService(FacilityRequestRepository facilityRequestRepository,
			ExhibitionRepository exhibitionRepository) {
		super();
		this.facilityRequestRepository = facilityRequestRepository;
		this.exhibitionRepository = exhibitionRepository;
	}

	@Transactional(readOnly = true)
    public Page<FacilityRequestDto> getAll(Pageable pageable) {
        return facilityRequestRepository.findAll(pageable).map(FacilityRequestDto::from);
    }

    @Transactional(readOnly = true)
    public Page<FacilityRequestDto> getForExhibitor(Long exhibitorId, Pageable pageable) {
        return facilityRequestRepository.findByExhibitorId(exhibitorId, pageable).map(FacilityRequestDto::from);
    }

    @Transactional
    public FacilityRequestDto create(CreateFacilityRequest req, User exhibitor) {
        Exhibition exhibition = exhibitionRepository.findById(req.getExhibitionId())
            .orElseThrow(() -> new ResourceNotFoundException("Exhibition", req.getExhibitionId()));
        FacilityRequest fr = new FacilityRequest();

        fr.setExhibitor(exhibitor);
        fr.setExhibition(exhibition);
        fr.setChairs(req.getChairs());
        fr.setTables(req.getTables());
        fr.setLights(req.getLights());
        fr.setElectricityRequired(req.isElectricityRequired());
        fr.setCustomRequirements(req.getCustomRequirements());

        return FacilityRequestDto.from(facilityRequestRepository.save(fr));
    }

    @Transactional
    public FacilityRequestDto fulfill(Long id, String note) {
        FacilityRequest fr = facilityRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FacilityRequest", id));
        if (fr.getStatus() == FacilityRequest.FacilityStatus.FULFILLED) {
            throw new BadRequestException("Request is already fulfilled");
        }
        fr.setStatus(FacilityRequest.FacilityStatus.FULFILLED);
        fr.setFulfilledByNote(note);
        return FacilityRequestDto.from(facilityRequestRepository.save(fr));
    }
}
