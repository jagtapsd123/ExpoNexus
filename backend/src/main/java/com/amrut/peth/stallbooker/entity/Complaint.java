package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_complaints_exhibitor", columnList = "exhibitor_id"),
    @Index(name = "idx_complaints_exhibition", columnList = "exhibition_id"),
    @Index(name = "idx_complaints_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint extends BaseEntity {

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getExhibitor() {
		return exhibitor;
	}

	public void setExhibitor(User exhibitor) {
		this.exhibitor = exhibitor;
	}

	public Exhibition getExhibition() {
		return exhibition;
	}

	public void setExhibition(Exhibition exhibition) {
		this.exhibition = exhibition;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public ComplaintStatus getStatus() {
		return status;
	}

	public void setStatus(ComplaintStatus status) {
		this.status = status;
	}

	public String getResolutionNote() {
		return resolutionNote;
	}

	public void setResolutionNote(String resolutionNote) {
		this.resolutionNote = resolutionNote;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibitor_id", nullable = false)
    private User exhibitor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exhibition_id", nullable = false)
    private Exhibition exhibition;

    @Column(nullable = false, length = 300)
    private String subject;

    @Column(nullable = false, length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.OPEN;

    @Column(name = "resolution_note", length = 1000)
    private String resolutionNote;

    public enum ComplaintStatus {
        OPEN, IN_PROGRESS, RESOLVED
    }
}
