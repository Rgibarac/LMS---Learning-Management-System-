package com.university.lms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "weekly_schedules")
public class WeeklySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "study_program_id", nullable = false)
    private Long studyProgramId;

    @Column(name = "year", nullable = false)
    private Integer year; 

    public WeeklySchedule() {}

    public WeeklySchedule(Long studyProgramId, Integer year) {
        this.studyProgramId = studyProgramId;
        this.year = year;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudyProgramId() { return studyProgramId; }
    public void setStudyProgramId(Long studyProgramId) { this.studyProgramId = studyProgramId; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}