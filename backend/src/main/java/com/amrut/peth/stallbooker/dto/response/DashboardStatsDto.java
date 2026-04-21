package com.amrut.peth.stallbooker.dto.response;

public class DashboardStatsDto {

    private long totalExhibitions;
    private long upcomingExhibitions;
    private long ongoingExhibitions;
    private long completedExhibitions;

    private long totalBookings;
    private long confirmedBookings;
    private long pendingBookings;
    private long cancelledBookings;

    private long totalUsers;
    private long pendingApprovals;
    private long totalExhibitors;
    private long totalOrganizers;

    private double totalRevenue;

    private long totalStalls;
    private long availableStalls;
    private long bookedStalls;

    private long pendingFacilityRequests;
    private long openComplaints;

    private long inquiries;
    private long payments;
    private long activeExhibitors;

    public DashboardStatsDto() {}

    public long getTotalExhibitions() { return totalExhibitions; }
    public void setTotalExhibitions(long v) { this.totalExhibitions = v; }

    public long getUpcomingExhibitions() { return upcomingExhibitions; }
    public void setUpcomingExhibitions(long v) { this.upcomingExhibitions = v; }

    public long getOngoingExhibitions() { return ongoingExhibitions; }
    public void setOngoingExhibitions(long v) { this.ongoingExhibitions = v; }

    public long getCompletedExhibitions() { return completedExhibitions; }
    public void setCompletedExhibitions(long v) { this.completedExhibitions = v; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long v) { this.totalBookings = v; }

    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long v) { this.confirmedBookings = v; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long v) { this.pendingBookings = v; }

    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long v) { this.cancelledBookings = v; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long v) { this.totalUsers = v; }

    public long getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(long v) { this.pendingApprovals = v; }

    public long getTotalExhibitors() { return totalExhibitors; }
    public void setTotalExhibitors(long v) { this.totalExhibitors = v; }

    public long getTotalOrganizers() { return totalOrganizers; }
    public void setTotalOrganizers(long v) { this.totalOrganizers = v; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double v) { this.totalRevenue = v; }

    public long getTotalStalls() { return totalStalls; }
    public void setTotalStalls(long v) { this.totalStalls = v; }

    public long getAvailableStalls() { return availableStalls; }
    public void setAvailableStalls(long v) { this.availableStalls = v; }

    public long getBookedStalls() { return bookedStalls; }
    public void setBookedStalls(long v) { this.bookedStalls = v; }

    public long getPendingFacilityRequests() { return pendingFacilityRequests; }
    public void setPendingFacilityRequests(long v) { this.pendingFacilityRequests = v; }

    public long getOpenComplaints() { return openComplaints; }
    public void setOpenComplaints(long v) { this.openComplaints = v; }

    public long getInquiries() { return inquiries; }
    public void setInquiries(long v) { this.inquiries = v; }

    public long getPayments() { return payments; }
    public void setPayments(long v) { this.payments = v; }

    public long getActiveExhibitors() { return activeExhibitors; }
    public void setActiveExhibitors(long v) { this.activeExhibitors = v; }
}
