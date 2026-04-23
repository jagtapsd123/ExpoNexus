package com.amrut.peth.stallbooker.dto.response;

public class ExhibitorDashboardDto {

    private double totalSales;
    private long reservedStalls;
    private long upcomingExhibitions;
    private long exhibitionsAttended;
    private long pendingRefunds;
    private long totalProducts;

    public ExhibitorDashboardDto() {}

    public double getTotalSales() { return totalSales; }
    public void setTotalSales(double totalSales) { this.totalSales = totalSales; }

    public long getReservedStalls() { return reservedStalls; }
    public void setReservedStalls(long reservedStalls) { this.reservedStalls = reservedStalls; }

    public long getUpcomingExhibitions() { return upcomingExhibitions; }
    public void setUpcomingExhibitions(long upcomingExhibitions) { this.upcomingExhibitions = upcomingExhibitions; }

    public long getExhibitionsAttended() { return exhibitionsAttended; }
    public void setExhibitionsAttended(long exhibitionsAttended) { this.exhibitionsAttended = exhibitionsAttended; }

    public long getPendingRefunds() { return pendingRefunds; }
    public void setPendingRefunds(long pendingRefunds) { this.pendingRefunds = pendingRefunds; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
}
