package com.amrut.peth.stallbooker.controller;

import com.amrut.peth.stallbooker.dto.ApiResponse;
import com.amrut.peth.stallbooker.dto.request.CreateExpenseRequest;
import com.amrut.peth.stallbooker.dto.response.ExhibitorExpenseDto;
import com.amrut.peth.stallbooker.entity.User;
import com.amrut.peth.stallbooker.service.ExhibitorExpenseService;
import com.amrut.peth.stallbooker.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@Tag(name = "Expenses", description = "Exhibitor expense tracking")
public class ExhibitorExpenseController {

    private final ExhibitorExpenseService expenseService;
    private final SecurityUtils securityUtils;

    public ExhibitorExpenseController(ExhibitorExpenseService expenseService, SecurityUtils securityUtils) {
        this.expenseService = expenseService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "List current exhibitor's expenses")
    public ResponseEntity<ApiResponse<Page<ExhibitorExpenseDto>>> myExpenses(Pageable pageable) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(expenseService.getMyExpenses(current.getId(), pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Log an expense")
    public ResponseEntity<ApiResponse<ExhibitorExpenseDto>> create(@Valid @RequestBody CreateExpenseRequest req) {
        User current = securityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Expense logged", expenseService.create(req, current)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EXHIBITOR')")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User current = securityUtils.getCurrentUser();
        expenseService.delete(id, current);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted"));
    }
}
