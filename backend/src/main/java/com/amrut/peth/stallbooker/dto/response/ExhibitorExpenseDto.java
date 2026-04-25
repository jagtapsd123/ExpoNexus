package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.ExhibitorExpense;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExhibitorExpenseDto {

    private Long id;
    private Long exhibitionId;
    private String exhibitionName;
    private String type;
    private double amount;
    private String note;
    private LocalDate expenseDate;
    private LocalDateTime createdAt;
    private Long bookingId;

    public static ExhibitorExpenseDto from(ExhibitorExpense e) {
        ExhibitorExpenseDto dto = new ExhibitorExpenseDto();
        dto.id = e.getId();
        if (e.getExhibition() != null) {
            dto.exhibitionId = e.getExhibition().getId();
            dto.exhibitionName = e.getExhibition().getName();
        }
        dto.type = e.getType();
        dto.amount = e.getAmount();
        dto.note = e.getNote();
        dto.expenseDate = e.getExpenseDate();
        dto.createdAt = e.getCreatedAt();
        dto.bookingId = e.getBookingId();
        return dto;
    }

    public Long getId() { return id; }
    public Long getExhibitionId() { return exhibitionId; }
    public String getExhibitionName() { return exhibitionName; }
    public String getType() { return type; }
    public double getAmount() { return amount; }
    public String getNote() { return note; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getBookingId() { return bookingId; }
}
