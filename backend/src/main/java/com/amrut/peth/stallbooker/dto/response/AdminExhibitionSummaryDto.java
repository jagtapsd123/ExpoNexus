package com.amrut.peth.stallbooker.dto.response;

import java.time.LocalDate;

public class AdminExhibitionSummaryDto {

    private Long exhibitionId;
    private String exhibitionName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String venue;
    private long totalStalls;
    private long bookedStalls;
    private long availableStalls;
    private long confirmedBookings;
    private long cancelledBookings;
    private double totalRevenue;

    public AdminExhibitionSummaryDto() {}

    public Long getExhibitionId() { return exhibitionId; }
    public void setExhibitionId(Long exhibitionId) { this.exhibitionId = exhibitionId; }

    public String getExhibitionName() { return exhibitionName; }
    public void setExhibitionName(String exhibitionName) { this.exhibitionName = exhibitionName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public long getTotalStalls() { return totalStalls; }
    public void setTotalStalls(long totalStalls) { this.totalStalls = totalStalls; }

    public long getBookedStalls() { return bookedStalls; }
    public void setBookedStalls(long bookedStalls) { this.bookedStalls = bookedStalls; }

    public long getAvailableStalls() { return availableStalls; }
    public void setAvailableStalls(long availableStalls) { this.availableStalls = availableStalls; }

    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }

    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long cancelledBookings) { this.cancelledBookings = cancelledBookings; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
}
