package com.amrut.peth.stallbooker.dto.response;

import com.amrut.peth.stallbooker.entity.FacilityType;

public class FacilityTypeDto {

    private Long id;
    private String name;
    private String icon;
    private String description;
    private boolean active;

    public FacilityTypeDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static FacilityTypeDto from(FacilityType f) {
        FacilityTypeDto dto = new FacilityTypeDto();
        dto.id = f.getId();
        dto.name = f.getName();
        dto.icon = f.getIcon();
        dto.description = f.getDescription();
        dto.active = f.isActive();
        return dto;
    }
}
