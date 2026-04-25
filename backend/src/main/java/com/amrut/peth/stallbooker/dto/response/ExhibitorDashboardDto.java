package com.amrut.peth.stallbooker.dto.response;

public class ExhibitorDashboardDto {

    // Revenue & Profit
    private double totalRevenue;
    private double totalProfit;
    private double totalExpenses;
    private double stallBookingCost;
    private double productCost;
    private double otherExpenses;
    private double roiPercent;

    // Inventory
    private long productsSold;
    private long totalQtyRemaining;
    private long totalProducts;
    private long outOfStockCount;
    private long lowStockCount;
    private String bestSellingProduct;

    // Exhibitions & Stalls
    private long reservedStalls;
    private long upcomingExhibitions;
    private long exhibitionsAttended;
    private long pendingRefunds;

    public ExhibitorDashboardDto() {}

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getTotalProfit() { return totalProfit; }
    public void setTotalProfit(double totalProfit) { this.totalProfit = totalProfit; }

    public double getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(double totalExpenses) { this.totalExpenses = totalExpenses; }

    public double getStallBookingCost() { return stallBookingCost; }
    public void setStallBookingCost(double stallBookingCost) { this.stallBookingCost = stallBookingCost; }

    public double getProductCost() { return productCost; }
    public void setProductCost(double productCost) { this.productCost = productCost; }

    public double getOtherExpenses() { return otherExpenses; }
    public void setOtherExpenses(double otherExpenses) { this.otherExpenses = otherExpenses; }

    public double getRoiPercent() { return roiPercent; }
    public void setRoiPercent(double roiPercent) { this.roiPercent = roiPercent; }

    public long getProductsSold() { return productsSold; }
    public void setProductsSold(long productsSold) { this.productsSold = productsSold; }

    public long getTotalQtyRemaining() { return totalQtyRemaining; }
    public void setTotalQtyRemaining(long totalQtyRemaining) { this.totalQtyRemaining = totalQtyRemaining; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public String getBestSellingProduct() { return bestSellingProduct; }
    public void setBestSellingProduct(String bestSellingProduct) { this.bestSellingProduct = bestSellingProduct; }

    public long getReservedStalls() { return reservedStalls; }
    public void setReservedStalls(long reservedStalls) { this.reservedStalls = reservedStalls; }

    public long getUpcomingExhibitions() { return upcomingExhibitions; }
    public void setUpcomingExhibitions(long upcomingExhibitions) { this.upcomingExhibitions = upcomingExhibitions; }

    public long getExhibitionsAttended() { return exhibitionsAttended; }
    public void setExhibitionsAttended(long exhibitionsAttended) { this.exhibitionsAttended = exhibitionsAttended; }

    public long getPendingRefunds() { return pendingRefunds; }
    public void setPendingRefunds(long pendingRefunds) { this.pendingRefunds = pendingRefunds; }
}
