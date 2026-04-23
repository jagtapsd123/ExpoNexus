package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "stall_category_types", uniqueConstraints = {
    @UniqueConstraint(name = "uq_stall_category_type_name", columnNames = "name")
})
public class StallCategoryType extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "stall_category_facilities",
        joinColumns = @JoinColumn(name = "stall_category_type_id"),
        inverseJoinColumns = @JoinColumn(name = "facility_id")
    )
    private Set<FacilityType> facilities = new HashSet<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Set<FacilityType> getFacilities() { return facilities; }
    public void setFacilities(Set<FacilityType> facilities) { this.facilities = facilities; }
}
