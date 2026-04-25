package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateExpenseRequest {

    @NotBlank(message = "Expense type is required")
    private String type;

    @Min(0)
    private double amount;

    private Long exhibitionId;
    private String note;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public Long getExhibitionId() { return exhibitionId; }
    public void setExhibitionId(Long exhibitionId) { this.exhibitionId = exhibitionId; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
}
