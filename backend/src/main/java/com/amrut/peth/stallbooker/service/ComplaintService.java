package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateComplaintRequest;
import com.amrut.peth.stallbooker.dto.response.ComplaintDto;
import com.amrut.peth.stallbooker.entity.Complaint;
import com.amrut.peth.stallbooker.entity.Exhibition;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ComplaintRepository;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service

public class ComplaintService {

    public ComplaintService(ComplaintRepository complaintRepository, ExhibitionRepository exhibitionRepository) {
		super();
		this.complaintRepository = complaintRepository;
		this.exhibitionRepository = exhibitionRepository;
	}

	private final ComplaintRepository complaintRepository;
    private final ExhibitionRepository exhibitionRepository;

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getAll(Pageable pageable) {
        return complaintRepository.findAll(pageable).map(ComplaintDto::from);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintDto> getForExhibitor(Long exhibitorId, Pageable pageable) {
        return complaintRepository.findByExhibitorId(exhibitorId, pageable).map(ComplaintDto::from);
    }

    @Transactional
    public ComplaintDto create(CreateComplaintRequest req, User exhibitor) {
        Exhibition exhibition = exhibitionRepository.findById(req.getExhibitionId())
            .orElseThrow(() -> new ResourceNotFoundException("Exhibition", req.getExhibitionId()));

        Complaint complaint = new Complaint();
        complaint.setExhibitor(exhibitor);
        complaint.setExhibition(exhibition);
        complaint.setSubject(req.getSubject());
        complaint.setDescription(req.getDescription());
           

        return ComplaintDto.from(complaintRepository.save(complaint));
    }

    @Transactional
    public ComplaintDto updateStatus(Long id, Complaint.ComplaintStatus status, String resolutionNote) {
        Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
        complaint.setStatus(status);
        if (resolutionNote != null) complaint.setResolutionNote(resolutionNote);
        return ComplaintDto.from(complaintRepository.save(complaint));
    }
}
