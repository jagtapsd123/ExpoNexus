package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.request.CreateExpenseRequest;
import com.amrut.peth.stallbooker.dto.response.ExhibitorExpenseDto;
import com.amrut.peth.stallbooker.entity.ExhibitorExpense;
import com.amrut.peth.stallbooker.entity.Exhibition;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.exception.ForbiddenException;
import com.amrut.peth.stallbooker.exception.ResourceNotFoundException;
import com.amrut.peth.stallbooker.repository.ExhibitionRepository;
import com.amrut.peth.stallbooker.repository.ExhibitorExpenseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExhibitorExpenseService {

    private final ExhibitorExpenseRepository expenseRepository;
    private final ExhibitionRepository exhibitionRepository;

    public ExhibitorExpenseService(ExhibitorExpenseRepository expenseRepository,
                                   ExhibitionRepository exhibitionRepository) {
        this.expenseRepository = expenseRepository;
        this.exhibitionRepository = exhibitionRepository;
    }

    @Transactional(readOnly = true)
    public Page<ExhibitorExpenseDto> getMyExpenses(Long exhibitorId, Pageable pageable) {
        return expenseRepository.findByExhibitorIdOrderByExpenseDateDesc(exhibitorId, pageable)
            .map(ExhibitorExpenseDto::from);
    }

    @Transactional
    public ExhibitorExpenseDto create(CreateExpenseRequest req, User exhibitor) {
        ExhibitorExpense expense = new ExhibitorExpense();
        expense.setExhibitor(exhibitor);
        expense.setType(req.getType());
        expense.setAmount(req.getAmount());
        expense.setNote(req.getNote());
        expense.setExpenseDate(req.getExpenseDate());
        if (req.getExhibitionId() != null) {
            Exhibition ex = exhibitionRepository.findById(req.getExhibitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Exhibition", req.getExhibitionId()));
            expense.setExhibition(ex);
        }
        return ExhibitorExpenseDto.from(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(Long id, User exhibitor) {
        ExhibitorExpense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Expense", id));
        if (!expense.getExhibitor().getId().equals(exhibitor.getId())) {
            throw new ForbiddenException("You can only delete your own expenses");
        }
        if (expense.getBookingId() != null) {
            throw new BadRequestException("This expense is auto-generated from a stall booking. Cancel the booking to remove it.");
        }
        expenseRepository.delete(expense);
    }
}
