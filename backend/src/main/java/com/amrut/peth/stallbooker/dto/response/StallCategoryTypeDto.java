package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.StallCategoryType;

import java.util.List;

public class StallCategoryTypeDto {

    private Long id;
    private String name;
    private String description;
    private boolean active;
    private List<FacilityTypeDto> facilities;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<FacilityTypeDto> getFacilities() { return facilities; }
    public void setFacilities(List<FacilityTypeDto> facilities) { this.facilities = facilities; }

    public static StallCategoryTypeDto from(StallCategoryType category) {
        StallCategoryTypeDto dto = new StallCategoryTypeDto();
        dto.id = category.getId();
        dto.name = category.getName();
        dto.description = category.getDescription();
        dto.active = category.isActive();
        dto.facilities = category.getFacilities().stream().map(FacilityTypeDto::from).toList();
        return dto;
    }
}
