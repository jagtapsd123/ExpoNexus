package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.response.*;
import com.amrut.peth.stallbooker.entity.*;
import com.amrut.peth.stallbooker.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final ExhibitionRepository exhibitionRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final StallRepository stallRepository;
    private final FacilityRequestRepository facilityRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final ProductRepository productRepository;
    private final ExhibitorExpenseRepository expenseRepository;
    private final ProductSaleRepository productSaleRepository;

    public DashboardService(ExhibitionRepository exhibitionRepository,
                            BookingRepository bookingRepository,
                            UserRepository userRepository,
                            StallRepository stallRepository,
                            FacilityRequestRepository facilityRequestRepository,
                            ComplaintRepository complaintRepository,
                            ProductRepository productRepository,
                            ExhibitorExpenseRepository expenseRepository,
                            ProductSaleRepository productSaleRepository) {
        this.exhibitionRepository = exhibitionRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.stallRepository = stallRepository;
        this.facilityRequestRepository = facilityRequestRepository;
        this.complaintRepository = complaintRepository;
        this.productRepository = productRepository;
        this.expenseRepository = expenseRepository;
        this.productSaleRepository = productSaleRepository;
    }

    // ─── Admin stats ─────────────────────────────────────────────────────────

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

        dto.setPendingFacilityRequests(facilityRequestRepository.countByStatus(FacilityRequest.FacilityStatus.PENDING));
        dto.setOpenComplaints(complaintRepository.countByStatus(Complaint.ComplaintStatus.OPEN));
        dto.setInquiries(bookingRepository.count());
        dto.setPayments(confirmedBookings);
        dto.setActiveExhibitors(userRepository.countByRole(User.Role.EXHIBITOR));
        return dto;
    }

    // ─── Admin exhibition-wise summary ───────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminExhibitionSummaryDto> getAdminExhibitionSummary() {
        return exhibitionRepository.findAll().stream()
            .sorted((a, b) -> b.getStartDate().compareTo(a.getStartDate()))
            .map(this::buildAdminExhibitionSummary)
            .toList();
    }

    private AdminExhibitionSummaryDto buildAdminExhibitionSummary(Exhibition ex) {
        Long exId = ex.getId();
        AdminExhibitionSummaryDto dto = new AdminExhibitionSummaryDto();
        dto.setExhibitionId(exId);
        dto.setExhibitionName(ex.getName());
        dto.setStatus(ex.getStatus().name().toLowerCase());
        dto.setStartDate(ex.getStartDate());
        dto.setEndDate(ex.getEndDate());
        dto.setVenue(ex.getVenue());
        dto.setTotalStalls(ex.getTotalStalls());

        long confirmed = bookingRepository.countByExhibitionIdAndStatus(exId, Booking.BookingStatus.CONFIRMED);
        long cancelled = bookingRepository.countByExhibitionIdAndStatus(exId, Booking.BookingStatus.CANCELLED);
        dto.setConfirmedBookings(confirmed);
        dto.setCancelledBookings(cancelled);
        dto.setBookedStalls(confirmed);
        dto.setAvailableStalls(Math.max(0, ex.getTotalStalls() - confirmed));

        Double rev = bookingRepository.sumRevenueByExhibition(exId);
        dto.setTotalRevenue(rev != null ? rev : 0.0);
        return dto;
    }

    // ─── Exhibitor stats ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExhibitorDashboardDto getExhibitorStats(Long exhibitorId) {
        LocalDate today = LocalDate.now();
        ExhibitorDashboardDto dto = new ExhibitorDashboardDto();

        // Revenue = price × soldQuantity for this exhibitor's products only
        Double revenue = productRepository.sumRevenueByExhibitor(exhibitorId);
        dto.setTotalRevenue(revenue != null ? revenue : 0.0);

        // Stall cost = confirmed+paid booking totals for THIS exhibitor (covers old bookings too)
        Double stallCost = bookingRepository.sumTotalSalesByExhibitor(exhibitorId);
        dto.setStallBookingCost(stallCost != null ? stallCost : 0.0);

        // Product cost = costPrice × soldQuantity for THIS exhibitor
        Double productCost = productRepository.sumProductCostByExhibitor(exhibitorId);
        dto.setProductCost(productCost != null ? productCost : 0.0);

        // Other expenses = manual expenses only (exclude auto-generated Stall Rent entries)
        Double otherExp = expenseRepository.sumByExhibitorExcludingType(exhibitorId, "Stall Rent");
        dto.setOtherExpenses(otherExp != null ? otherExp : 0.0);

        double totalExpenses = dto.getStallBookingCost() + dto.getProductCost() + dto.getOtherExpenses();
        dto.setTotalExpenses(totalExpenses);

        double profit = dto.getTotalRevenue() - totalExpenses;
        dto.setTotalProfit(profit);
        // ROI hidden per product requirement — kept in DTO for future use
        dto.setRoiPercent(0.0);

        // Inventory (all exhibitor-scoped)
        Long sold = productRepository.sumSoldQtyByExhibitor(exhibitorId);
        dto.setProductsSold(sold != null ? sold : 0L);

        Long remaining = productRepository.sumRemainingQtyByExhibitor(exhibitorId);
        dto.setTotalQtyRemaining(remaining != null ? remaining : 0L);

        dto.setTotalProducts(productRepository.countByExhibitorIdAndActiveTrue(exhibitorId));
        dto.setOutOfStockCount(productRepository.countOutOfStockByExhibitor(exhibitorId));
        dto.setLowStockCount(productRepository.countLowStockByExhibitor(exhibitorId));

        List<Product> top = productRepository
            .findByExhibitorIdAndActiveTrueOrderBySoldQuantityDesc(exhibitorId, PageRequest.of(0, 1));
        dto.setBestSellingProduct(top.isEmpty() ? null : top.get(0).getName());

        // Stall & exhibition counts (all exhibitor-scoped)
        dto.setUpcomingExhibitions(bookingRepository.countUpcomingByExhibitor(exhibitorId, today));
        dto.setExhibitionsAttended(bookingRepository.countPastByExhibitor(exhibitorId, today));
        dto.setReservedStalls(bookingRepository.countByExhibitorIdAndStatus(exhibitorId, Booking.BookingStatus.CONFIRMED));
        dto.setPendingRefunds(bookingRepository.countRefundsByExhibitor(exhibitorId));

        return dto;
    }

    // ─── Exhibitor exhibition reports ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ExhibitionReportDto> getExhibitionReports(Long exhibitorId) {
        List<Exhibition> exhibitions = bookingRepository.findExhibitionsByExhibitorId(exhibitorId);
        return exhibitions.stream().map(ex -> buildExhibitionReport(exhibitorId, ex)).toList();
    }

    private ExhibitionReportDto buildExhibitionReport(Long exhibitorId, Exhibition ex) {
        Long exhibitionId = ex.getId();
        ExhibitionReportDto dto = new ExhibitionReportDto();
        dto.setExhibitionId(exhibitionId);
        dto.setExhibitionName(ex.getName());
        dto.setStatus(ex.getStatus().name().toLowerCase());
        dto.setStartDate(ex.getStartDate());
        dto.setEndDate(ex.getEndDate());

        // Stall cost = THIS exhibitor's confirmed booking totals for this exhibition
        Double stallCost = bookingRepository.sumTotalByExhibitorAndExhibition(exhibitorId, exhibitionId);
        dto.setStallCost(stallCost != null ? stallCost : 0.0);

        long productsAdded = productRepository.countByExhibitorIdAndExhibitionIdAndActiveTrue(exhibitorId, exhibitionId);
        dto.setProductsAdded((int) productsAdded);

        Long totalStock = productRepository.sumQuantityByExhibitorAndExhibition(exhibitorId, exhibitionId);
        dto.setTotalStockAdded(totalStock != null ? totalStock.intValue() : 0);

        Long soldQty = productRepository.sumSoldQtyByExhibitorAndExhibition(exhibitorId, exhibitionId);
        dto.setSoldQuantity(soldQty != null ? soldQty.intValue() : 0);
        dto.setUnsoldQuantity(dto.getTotalStockAdded() - dto.getSoldQuantity());

        Double revenue = productRepository.sumRevenueByExhibitorAndExhibition(exhibitorId, exhibitionId);
        dto.setRevenue(revenue != null ? revenue : 0.0);

        Double productCost = productRepository.sumProductCostByExhibitorAndExhibition(exhibitorId, exhibitionId);
        dto.setProductCost(productCost != null ? productCost : 0.0);

        // Other expenses: exclude Stall Rent (already counted in stallCost above)
        Double otherExp = expenseRepository.sumByExhibitorAndExhibitionExcludingType(exhibitorId, exhibitionId, "Stall Rent");
        dto.setOtherExpenses(otherExp != null ? otherExp : 0.0);

        // Net profit: revenue minus all three expense categories (no double-counting)
        double netProfit = dto.getRevenue() - dto.getStallCost() - dto.getProductCost() - dto.getOtherExpenses();
        dto.setNetProfit(netProfit);
        dto.setRoiPercent(0.0); // hidden

        List<Product> topProducts = productRepository
            .findByExhibitorIdAndExhibitionIdAndActiveTrueOrderBySoldQuantityDesc(
                exhibitorId, exhibitionId, PageRequest.of(0, 1));
        dto.setBestSellingProduct(topProducts.isEmpty() ? null : topProducts.get(0).getName());

        return dto;
    }

    // ─── Monthly sales chart ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MonthlySalesDto> getMonthlySales(Long exhibitorId) {
        return productSaleRepository.findMonthlySalesByExhibitor(exhibitorId).stream()
            .map(row -> new MonthlySalesDto(
                ((Number) row[0]).intValue(),
                ((Number) row[1]).intValue(),
                ((Number) row[2]).doubleValue()))
            .toList();
    }
}
