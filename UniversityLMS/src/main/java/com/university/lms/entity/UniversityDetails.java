// src/main/java/com/university/lms/entity/UniversityDetails.java

package com.university.lms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "university_details")
public class UniversityDetails {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private University university;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    private String location;

    @Column(name = "full_description", length = 2000)
    private String fullDescription;

    @Column(name = "rector_id")
    private Long rectorId;

    @Column(name = "rector_name")
    private String rectorName;

    @Column(name = "rector_description")
    private String rectorDescription;

    // Constructors
    public UniversityDetails() {}

    public UniversityDetails(University university) {
        this.university = university;
        this.id = university.getId();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public University getUniversity() {
        return university;
    }

    public void setUniversity(University university) {
        this.university = university;
        if (university != null) {
            this.id = university.getId();
        }
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getFullDescription() {
        return fullDescription;
    }

    public void setFullDescription(String fullDescription) {
        this.fullDescription = fullDescription;
    }

    public Long getRectorId() {
        return rectorId;
    }

    public void setRectorId(Long rectorId) {
        this.rectorId = rectorId;
    }

    public String getRectorName() {
        return rectorName;
    }

    public void setRectorName(String rectorName) {
        this.rectorName = rectorName;
    }

    public String getRectorDescription() {
        return rectorDescription;
    }

    public void setRectorDescription(String rectorDescription) {
        this.rectorDescription = rectorDescription;
    }
}