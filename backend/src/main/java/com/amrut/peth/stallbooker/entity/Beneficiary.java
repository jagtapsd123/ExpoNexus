package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "beneficiaries", indexes = {
    @Index(name = "idx_beneficiaries_name",     columnList = "name"),
    @Index(name = "idx_beneficiaries_category",  columnList = "category")
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 20)
    private String mobile;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String category;

    @Column(name = "business_name", length = 200)
    private String businessName;

    @Column(name = "business_type", length = 100)
    private String businessType;

    @Column(name = "beneficiary_code", unique = true, length = 50)
    private String beneficiaryCode;

    @Column(name = "stall_number", length = 20)
    private String stallNumber;

    @Column(name = "exhibition_date", length = 100)
    private String exhibitionDate;

    @Column(name = "total_turnover", precision = 15, scale = 2)
    private BigDecimal totalTurnover;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }

    public String getBeneficiaryCode() { return beneficiaryCode; }
    public void setBeneficiaryCode(String beneficiaryCode) { this.beneficiaryCode = beneficiaryCode; }

    public String getStallNumber() { return stallNumber; }
    public void setStallNumber(String stallNumber) { this.stallNumber = stallNumber; }

    public String getExhibitionDate() { return exhibitionDate; }
    public void setExhibitionDate(String exhibitionDate) { this.exhibitionDate = exhibitionDate; }

    public BigDecimal getTotalTurnover() { return totalTurnover; }
    public void setTotalTurnover(BigDecimal totalTurnover) { this.totalTurnover = totalTurnover; }
}
