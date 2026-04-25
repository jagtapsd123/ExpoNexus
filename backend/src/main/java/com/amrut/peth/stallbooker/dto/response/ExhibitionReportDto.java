package com.amrut.peth.stallbooker.dto.response;

import java.time.LocalDate;

public class ExhibitionReportDto {

    private Long exhibitionId;
    private String exhibitionName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private double stallCost;
    private int productsAdded;
    private int totalStockAdded;
    private int soldQuantity;
    private int unsoldQuantity;
    private double revenue;
    private double productCost;
    private double otherExpenses;
    private double netProfit;
    private double roiPercent;
    private String bestSellingProduct;

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

    public double getStallCost() { return stallCost; }
    public void setStallCost(double stallCost) { this.stallCost = stallCost; }

    public int getProductsAdded() { return productsAdded; }
    public void setProductsAdded(int productsAdded) { this.productsAdded = productsAdded; }

    public int getTotalStockAdded() { return totalStockAdded; }
    public void setTotalStockAdded(int totalStockAdded) { this.totalStockAdded = totalStockAdded; }

    public int getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(int soldQuantity) { this.soldQuantity = soldQuantity; }

    public int getUnsoldQuantity() { return unsoldQuantity; }
    public void setUnsoldQuantity(int unsoldQuantity) { this.unsoldQuantity = unsoldQuantity; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }

    public double getProductCost() { return productCost; }
    public void setProductCost(double productCost) { this.productCost = productCost; }

    public double getOtherExpenses() { return otherExpenses; }
    public void setOtherExpenses(double otherExpenses) { this.otherExpenses = otherExpenses; }

    public double getNetProfit() { return netProfit; }
    public void setNetProfit(double netProfit) { this.netProfit = netProfit; }

    public double getRoiPercent() { return roiPercent; }
    public void setRoiPercent(double roiPercent) { this.roiPercent = roiPercent; }

    public String getBestSellingProduct() { return bestSellingProduct; }
    public void setBestSellingProduct(String bestSellingProduct) { this.bestSellingProduct = bestSellingProduct; }
}
