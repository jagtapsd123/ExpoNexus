package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.response.DashboardStatsDto;
import com.amrut.peth.stallbooker.dto.response.ExhibitorDashboardDto;
import com.amrut.peth.stallbooker.entity.*;
import com.amrut.peth.stallbooker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final ExhibitionRepository exhibitionRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final StallRepository stallRepository;
    private final FacilityRequestRepository facilityRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final ProductRepository productRepository;

    public DashboardService(ExhibitionRepository exhibitionRepository,
                            BookingRepository bookingRepository,
                            UserRepository userRepository,
                            StallRepository stallRepository,
                            FacilityRequestRepository facilityRequestRepository,
                            ComplaintRepository complaintRepository,
                            ProductRepository productRepository) {
        this.exhibitionRepository = exhibitionRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.stallRepository = stallRepository;
        this.facilityRequestRepository = facilityRequestRepository;
        this.complaintRepository = complaintRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        Double revenue = bookingRepository.sumTotalRevenue();
        long totalStalls = stallRepository.count();
        long confirmedBookings = bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED);
        long availableStalls = Math.max(0, totalStalls - confirmedBookings);

        DashboardStatsDto dto = new DashboardStatsDto();

        dto.setTotalExhibitions(exhibitionRepository.count());
        dto.setUpcomingExhibitions(exhibitionRepository.countByStatus(Exhibition.Status.UPCOMING));
        dto.setOngoingExhibitions(exhibitionRepository.countByStatus(Exhibition.Status.ONGOING));
        dto.setCompletedExhibitions(exhibitionRepository.countByStatus(Exhibition.Status.COMPLETED));

        dto.setTotalBookings(bookingRepository.count());
        dto.setConfirmedBookings(confirmedBookings);
        dto.setPendingBookings(bookingRepository.countByStatus(Booking.BookingStatus.PENDING));
        dto.setCancelledBookings(bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED));

        dto.setTotalUsers(userRepository.count());
        dto.setPendingApprovals(userRepository.countByStatus(User.Status.PENDING));
        dto.setTotalExhibitors(userRepository.countByRole(User.Role.EXHIBITOR));
        dto.setTotalOrganizers(userRepository.countByRole(User.Role.ORGANIZER));

        dto.setTotalRevenue(revenue != null ? revenue : 0.0);

        dto.setTotalStalls(totalStalls);
        dto.setBookedStalls(confirmedBookings);
        dto.setAvailableStalls(availableStalls);

        dto.setPendingFacilityRequests(
            facilityRequestRepository.countByStatus(FacilityRequest.FacilityStatus.PENDING));
        dto.setOpenComplaints(
            complaintRepository.countByStatus(Complaint.ComplaintStatus.OPEN));

        dto.setInquiries(bookingRepository.count());
        dto.setPayments(confirmedBookings);
        dto.setActiveExhibitors(userRepository.countByRole(User.Role.EXHIBITOR));

        return dto;
    }

    @Transactional(readOnly = true)
    public ExhibitorDashboardDto getExhibitorStats(Long exhibitorId) {
        LocalDate today = LocalDate.now();

        ExhibitorDashboardDto dto = new ExhibitorDashboardDto();
        Double sales = bookingRepository.sumTotalSalesByExhibitor(exhibitorId);
        dto.setTotalSales(sales != null ? sales : 0.0);
        dto.setReservedStalls(bookingRepository.countByExhibitorIdAndStatus(exhibitorId, Booking.BookingStatus.CONFIRMED));
        dto.setUpcomingExhibitions(bookingRepository.countUpcomingByExhibitor(exhibitorId, today));
        dto.setExhibitionsAttended(bookingRepository.countPastByExhibitor(exhibitorId, today));
        dto.setPendingRefunds(bookingRepository.countRefundsByExhibitor(exhibitorId));
        dto.setTotalProducts(productRepository.countByExhibitorIdAndActiveTrue(exhibitorId));
        return dto;
    }
}
