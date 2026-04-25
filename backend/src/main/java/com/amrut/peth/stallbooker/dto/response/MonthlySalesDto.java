package com.amrut.peth.stallbooker.dto.response;

public class MonthlySalesDto {

    private int year;
    private int month;
    private String monthLabel;
    private double revenue;

    private static final String[] MONTH_NAMES =
        { "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

    public MonthlySalesDto(int year, int month, double revenue) {
        this.year = year;
        this.month = month;
        this.monthLabel = MONTH_NAMES[month] + " " + year;
        this.revenue = revenue;
    }

    public int getYear() { return year; }
    public int getMonth() { return month; }
    public String getMonthLabel() { return monthLabel; }
    public double getRevenue() { return revenue; }
}
