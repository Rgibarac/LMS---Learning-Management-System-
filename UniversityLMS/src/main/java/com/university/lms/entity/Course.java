package com.university.lms.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String code;
    private int ectsPoints;
    private Long studyProgramId;

    public Course() {}
    public Course(String name, String description, String code, int ectsPoints, Long studyProgramId) {
        this.name = name;
        this.description = description;
        this.code = code;
        this.ectsPoints = ectsPoints;
        this.studyProgramId = studyProgramId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public int getEctsPoints() { return ectsPoints; }
    public void setEctsPoints(int ectsPoints) { this.ectsPoints = ectsPoints; }
    public Long getStudyProgramId() { return studyProgramId; }
    public void setStudyProgramId(Long studyProgramId) { this.studyProgramId = studyProgramId; }
}