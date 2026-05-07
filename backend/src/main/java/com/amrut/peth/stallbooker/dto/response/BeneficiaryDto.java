package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.Beneficiary;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BeneficiaryDto {

    private Long id;
    private String name;
    private String mobile;
    private String address;
    private String category;
    private String businessName;
    private String businessType;
    private String beneficiaryCode;
    private String stallNumber;
    private String exhibitionDate;
    private BigDecimal totalTurnover;
    private LocalDateTime createdAt;

    public static BeneficiaryDto from(Beneficiary b) {
        BeneficiaryDto dto = new BeneficiaryDto();
        dto.id              = b.getId();
        dto.name            = b.getName();
        dto.mobile          = b.getMobile();
        dto.address         = b.getAddress();
        dto.category        = b.getCategory();
        dto.businessName    = b.getBusinessName();
        dto.businessType    = b.getBusinessType();
        dto.beneficiaryCode = b.getBeneficiaryCode();
        dto.stallNumber     = b.getStallNumber();
        dto.exhibitionDate  = b.getExhibitionDate();
        dto.totalTurnover   = b.getTotalTurnover();
        dto.createdAt       = b.getCreatedAt();
        return dto;
    }

    public Long getId()                  { return id; }
    public String getName()              { return name; }
    public String getMobile()            { return mobile; }
    public String getAddress()           { return address; }
    public String getCategory()          { return category; }
    public String getBusinessName()      { return businessName; }
    public String getBusinessType()      { return businessType; }
    public String getBeneficiaryCode()   { return beneficiaryCode; }
    public String getStallNumber()       { return stallNumber; }
    public String getExhibitionDate() { return exhibitionDate; }
    public BigDecimal getTotalTurnover() { return totalTurnover; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
}
