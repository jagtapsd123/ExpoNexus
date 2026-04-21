package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.SaveLayoutRequest;
import com.amrut.peth.stallbooker.dto.response.StallLayoutDto;
import com.amrut.peth.stallbooker.entity.*;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import com.amrut.peth.stallbooker.repository.StallLayoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StallLayoutService {

    private final StallLayoutRepository stallLayoutRepository;
    private final ExhibitionRepository exhibitionRepository;

    public StallLayoutService(StallLayoutRepository stallLayoutRepository, ExhibitionRepository exhibitionRepository) {
		super();
		this.stallLayoutRepository = stallLayoutRepository;
		this.exhibitionRepository = exhibitionRepository;
	}

	@Transactional(readOnly = true)
    public StallLayoutDto getByExhibition(Long exhibitionId) {
        StallLayout layout = stallLayoutRepository.findByExhibitionId(exhibitionId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Stall layout for exhibition " + exhibitionId + " not found"));
        return StallLayoutDto.from(layout);
    }

    @Transactional
    public StallLayoutDto save(Long exhibitionId, SaveLayoutRequest req) {
        Exhibition exhibition = exhibitionRepository.findById(exhibitionId)
            .orElseThrow(() -> new ResourceNotFoundException("Exhibition", exhibitionId));

        StallLayout layout = stallLayoutRepository.findByExhibitionId(exhibitionId)
        	    .orElseGet(() -> {
        	        StallLayout newLayout = new StallLayout();
        	        newLayout.setExhibition(exhibition);
        	        return newLayout;
        	    });

        layout.setMode(StallLayout.LayoutMode.valueOf(req.getMode().toUpperCase()));
        layout.setLayoutImageUrl(req.getLayoutImageUrl());
        layout.setPrimeCount(req.getPrimeCount());
        layout.setSuperCount(req.getSuperCount());
        layout.setGeneralCount(req.getGeneralCount());
        layout.setPrimePrice(req.getPrimePrice());
        layout.setSuperPrice(req.getSuperPrice());
        layout.setGeneralPrice(req.getGeneralPrice());

        // Rebuild markers
        layout.getMarkers().clear();
        if (req.getMarkers() != null) {
            List<StallMarker> markers = new ArrayList<>();
            for (SaveLayoutRequest.MarkerDto m : req.getMarkers()) {
            	StallMarker marker = new StallMarker();

            	marker.setLayout(layout);
            	marker.setNumber(m.getNumber());
            	marker.setCategory(
            	    StallCategoryConfig.StallCategory.valueOf(
            	        m.getCategory().toUpperCase()
            	    )
            	);
            	marker.setPrice(m.getPrice());
            	marker.setStatus(
            	    StallMarker.MarkerStatus.valueOf(
            	        m.getStatus().toUpperCase()
            	    )
            	);
            	marker.setX(m.getX());
            	marker.setY(m.getY());
            	marker.setW(m.getW());
            	marker.setH(m.getH());
                markers.add(marker);
            }
            layout.getMarkers().addAll(markers);
        }

        return StallLayoutDto.from(stallLayoutRepository.save(layout));
    }

    @Transactional
    public void delete(Long exhibitionId) {
        stallLayoutRepository.deleteByExhibitionId(exhibitionId);
    }
}
