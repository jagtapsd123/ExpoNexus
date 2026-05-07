package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "districts", schema = "public")
public class District {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "divisionid", nullable = false)
    private Integer divisionId;

    @Column(name = "districtname", nullable = false, length = 100)
    private String districtName;

    public District() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getDivisionId() { return divisionId; }
    public void setDivisionId(Integer divisionId) { this.divisionId = divisionId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }
}
