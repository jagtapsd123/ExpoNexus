package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "exhibitor_expenses", indexes = {
    @Index(name = "idx_expenses_exhibitor",  columnList = "exhibitor_id"),
    @Index(name = "idx_expenses_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_expenses_date",       columnList = "expense_date")
})
public class ExhibitorExpense extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exhibition_id")
    private Exhibition exhibition;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(nullable = false)
    private double amount;

    @Column(length = 500)
    private String note;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "booking_id")
    private Long bookingId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getExhibitor() { return exhibitor; }
    public void setExhibitor(User exhibitor) { this.exhibitor = exhibitor; }

    public Exhibition getExhibition() { return exhibition; }
    public void setExhibition(Exhibition exhibition) { this.exhibition = exhibition; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
}
