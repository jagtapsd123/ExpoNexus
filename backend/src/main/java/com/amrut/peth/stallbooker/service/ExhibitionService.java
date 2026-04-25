package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateExhibitionRequest;
import com.amrut.peth.stallbooker.dto.response.ExhibitionDto;
import com.amrut.peth.stallbooker.entity.*;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import com.amrut.peth.stallbooker.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ExhibitionService {

    private final ExhibitionRepository exhibitionRepository;
    private final UserRepository userRepository;
    private final IdSequenceService idSequenceService;

    public ExhibitionService(ExhibitionRepository exhibitionRepository,
                             UserRepository userRepository,
                             IdSequenceService idSequenceService) {
        this.exhibitionRepository = exhibitionRepository;
        this.userRepository = userRepository;
        this.idSequenceService = idSequenceService;
    }

	@Transactional(readOnly = true)
    public Page<ExhibitionDto> searchExhibitions(Exhibition.Status status, String search, Pageable pageable) {
        return exhibitionRepository.searchExhibitions(status, search, pageable).map(ExhibitionDto::from);
    }

    @Transactional(readOnly = true)
    public ExhibitionDto getById(Long id) {
        return ExhibitionDto.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<ExhibitionDto> getForOrganizer(Long organizerId, Exhibition.Status status) {
        return exhibitionRepository.findByAssignedOrganizer(organizerId, status)
            .stream().map(ExhibitionDto::from).toList();
    }

    @Transactional
    public ExhibitionDto create(CreateExhibitionRequest req) {
        Exhibition exhibition = new Exhibition();
        exhibition.setEventId(idSequenceService.nextEventId());
        exhibition.setName(req.getName());
        exhibition.setStartDate(req.getStartDate());
        exhibition.setEndDate(req.getEndDate());
        exhibition.setTime(req.getTime());
        exhibition.setVenue(req.getVenue());
        exhibition.setDescription(req.getDescription());
        exhibition.setOrganizerName(req.getOrganizerName());
        exhibition.recalculateStatus();

        var cfg = req.getStallConfig();
        int total = cfg.getPrimeCount() + cfg.getSuperCount() + cfg.getGeneralCount();
        exhibition.setTotalStalls(total);

        // Assign organizers
        if (req.getAssignedOrganizerIds() != null) {
            Set<User> organizers = new HashSet<>(
                userRepository.findAllById(req.getAssignedOrganizerIds()));
            exhibition.setAssignedOrganizers(organizers);
        }

        exhibitionRepository.save(exhibition);

        // Create stall category configs
        if (cfg.getPrimeCount() > 0) addCategory(exhibition, StallCategoryConfig.StallCategory.PRIME, cfg.getPrimeCount(), cfg.getPrimePrice());
        if (cfg.getSuperCount() > 0) addCategory(exhibition, StallCategoryConfig.StallCategory.SUPER, cfg.getSuperCount(), cfg.getSuperPrice());
        if (cfg.getGeneralCount() > 0) addCategory(exhibition, StallCategoryConfig.StallCategory.GENERAL, cfg.getGeneralCount(), cfg.getGeneralPrice());

        // Auto-create stall instances
        generateStalls(exhibition, cfg);

        return ExhibitionDto.from(exhibitionRepository.save(exhibition));
    }

    @Transactional
    public ExhibitionDto toggleRevenueVisibility(Long id, boolean visible) {
        Exhibition exhibition = findOrThrow(id);
        exhibition.setShowRevenueToExhibitors(visible);
        return ExhibitionDto.from(exhibitionRepository.save(exhibition));
    }

    @Transactional
    public ExhibitionDto assignOrganizers(Long id, List<Long> organizerIds) {
        Exhibition exhibition = findOrThrow(id);
        Set<User> organizers = new HashSet<>(userRepository.findAllById(organizerIds));
        exhibition.setAssignedOrganizers(organizers);
        return ExhibitionDto.from(exhibitionRepository.save(exhibition));
    }

    @Transactional
    public ExhibitionDto setBannerImage(Long id, String url) {
        Exhibition exhibition = findOrThrow(id);
        exhibition.setBannerImageUrl(url);
        return ExhibitionDto.from(exhibitionRepository.save(exhibition));
    }

    @Transactional
    public ExhibitionDto setOrganizerName(Long id, String name) {
        Exhibition exhibition = findOrThrow(id);
        exhibition.setOrganizerName(name);
        return ExhibitionDto.from(exhibitionRepository.save(exhibition));
    }

    @Transactional
    public void delete(Long id) {
        Exhibition exhibition = findOrThrow(id);
        exhibitionRepository.delete(exhibition);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 1 0 * * *")
    @Transactional
    public void syncStatuses() {
        exhibitionRepository.findAll().forEach(e -> {
            Exhibition.Status prev = e.getStatus();
            e.recalculateStatus();
            if (prev != e.getStatus()) exhibitionRepository.save(e);
        });
    }

    private void addCategory(Exhibition exhibition, StallCategoryConfig.StallCategory cat, int total, double price) {
    	 StallCategoryConfig c = new StallCategoryConfig();

    	    c.setExhibition(exhibition);
    	    c.setCategory(cat);
    	    c.setTotal(total);
    	    c.setPrice(price);

    	    exhibition.getStallCategories().add(c);
    }

    private void generateStalls(Exhibition exhibition, CreateExhibitionRequest.StallConfig cfg) {
        int num = 1;
        num = createStalls(exhibition, StallCategoryConfig.StallCategory.PRIME, cfg.getPrimeCount(), cfg.getPrimePrice(), num);
        num = createStalls(exhibition, StallCategoryConfig.StallCategory.SUPER, cfg.getSuperCount(), cfg.getSuperPrice(), num);
        createStalls(exhibition, StallCategoryConfig.StallCategory.GENERAL, cfg.getGeneralCount(), cfg.getGeneralPrice(), num);
    }

    private int createStalls(Exhibition exhibition, StallCategoryConfig.StallCategory category, int count, double price, int startNum) {
        for (int i = 0; i < count; i++) {
            Stall stall = new Stall();
            stall.setExhibition(exhibition);
            stall.setNumber(String.format("S%03d", startNum + i));
            stall.setCategory(category);
            stall.setPrice(price);
            stall.setStatus(Stall.StallStatus.AVAILABLE);
            stall.setActive(true);
                
            exhibition.getStalls().add(stall);
        }
        return startNum + count;
    }

    private Exhibition findOrThrow(Long id) {
        return exhibitionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Exhibition", id));
    }
}
