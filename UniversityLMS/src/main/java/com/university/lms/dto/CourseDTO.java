package com.university.lms.dto;

public class CourseDTO {
    private Long id;
    private String name;
    private String description;
    private String code;
    private int ectsPoints;
    private Long studyProgramId;

    public CourseDTO() {}

    public CourseDTO(Long id, String name, String description, String code, int ectsPoints, Long studyProgramId) {
        this.id = id;
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