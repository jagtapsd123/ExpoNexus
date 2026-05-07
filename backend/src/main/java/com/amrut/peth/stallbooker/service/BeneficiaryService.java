package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.dto.response.BeneficiaryDto;
import com.amrut.peth.stallbooker.entity.Beneficiary;
import com.amrut.peth.stallbooker.exception.BadRequestException;
import com.amrut.peth.stallbooker.repository.BeneficiaryRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final EntityManager entityManager;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository, EntityManager entityManager) {
		super();
		this.beneficiaryRepository = beneficiaryRepository;
        this.entityManager = entityManager;
	}

	@Transactional(readOnly = true)
    public Page<BeneficiaryDto> getAll(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return beneficiaryRepository.findAll(pageable).map(BeneficiaryDto::from);
        }
        return beneficiaryRepository.searchByText(search.trim(), pageable).map(BeneficiaryDto::from);
    }

    @Transactional
    public Map<String, Object> importFromExcel(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            throw new BadRequestException("Only Excel files (.xlsx or .xls) are supported");
        }

        List<Beneficiary> toSave  = new ArrayList<>();
        List<String>      skipped = new ArrayList<>();
        Set<String>       seenCodes = new HashSet<>();
        int totalRows = 0;

        try (Workbook workbook = openWorkbook(file, filename)) {
            Sheet sheet = workbook.getSheetAt(0);
            // Row 0 is the header — start from row 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isBlankRow(row)) continue;
                totalRows++;

                String name = cellText(row, 2);
                if (name.isBlank()) {
                    skipped.add("Row " + (i + 1) + ": Name is required");
                    continue;
                }

                String code = cellText(row, 6);
                if (!code.isBlank()) {
                    String normalizedCode = code.toLowerCase();
                    if (!seenCodes.add(normalizedCode)) {
                        skipped.add("Row " + (i + 1) + ": Duplicate beneficiary code '" + code + "' in uploaded file");
                        continue;
                    }
                    if (beneficiaryRepository.existsByBeneficiaryCode(code)) {
                        skipped.add("Row " + (i + 1) + ": Duplicate beneficiary code '" + code + "'");
                        continue;
                    }
                }

                Beneficiary b = new Beneficiary();
                b.setName(name);
                b.setMobile(null);
                b.setAddress(cellText(row, 0));
                b.setCategory(cellText(row, 5));
                b.setBusinessName(null);
                b.setBusinessType(cellText(row, 5));
                b.setBeneficiaryCode(code.isBlank() ? null : code);
                String stallNum = cellText(row, 1);
                b.setStallNumber(stallNum.isBlank() ? null : stallNum);
                String exhibitionDate = cellText(row, 3);
                b.setExhibitionDate(exhibitionDate.isBlank() ? null : exhibitionDate);
                b.setTotalTurnover(cellDecimal(row, 4));
                toSave.add(b);
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read Excel file: " + e.getMessage());
        }

        resetSequenceIfEmpty(toSave);
        beneficiaryRepository.saveAll(toSave);

        return Map.of(
            "totalRows", totalRows,
            "imported",  toSave.size(),
            "skipped",   skipped.size(),
            "errors",    skipped
        );
    }

    private Workbook openWorkbook(MultipartFile file, String filename) throws IOException {
        if (filename.endsWith(".xlsx")) {
            return new XSSFWorkbook(file.getInputStream());
        }
        return new HSSFWorkbook(file.getInputStream());
    }

    private void resetSequenceIfEmpty(List<Beneficiary> toSave) {
        if (toSave.isEmpty() || beneficiaryRepository.count() > 0) return;
        entityManager.createNativeQuery(
            "SELECT setval(pg_get_serial_sequence('beneficiaries', 'id'), 1, false)"
        ).getSingleResult();
    }

    private boolean isBlankRow(Row row) {
        for (int c = 0; c < 10; c++) {
            if (!cellText(row, c).isBlank()) return false;
        }
        return true;
    }

    private String cellText(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) yield cell.getLocalDateTimeCellValue().toString();
                double v = cell.getNumericCellValue();
                yield (v == Math.floor(v)) ? String.valueOf((long) v) : String.valueOf(v);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield cell.getStringCellValue().trim(); }
                catch (Exception ex) { yield String.valueOf(cell.getNumericCellValue()); }
            }
            default -> "";
        };
    }

    private BigDecimal cellDecimal(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        String text = cellText(row, col).replaceAll("[^0-9.\\-]", "").trim();
        if (text.isBlank()) return null;
        try { return new BigDecimal(text); } catch (NumberFormatException ignored) { return null; }
    }
}
