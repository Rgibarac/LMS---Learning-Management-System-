package com.university.lms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "year_enrollments")
public class YearEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "index_number", nullable = false)
    private String indexNumber; 

    @Column(name = "enrollment_year", nullable = false)
    private Integer yearOfEnrollment; 

    @Column(name = "date_of_enrollment", nullable = false)
    private LocalDate dateOfEnrollment;

    @Column(name = "study_program_id", nullable = false)
    private Long studyProgramId;

    public YearEnrollment() {}

    public YearEnrollment(String indexNumber, Integer yearOfEnrollment, 
                          LocalDate dateOfEnrollment, Long studyProgramId) {
        this.indexNumber = indexNumber;
        this.yearOfEnrollment = yearOfEnrollment;
        this.dateOfEnrollment = dateOfEnrollment;
        this.studyProgramId = studyProgramId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIndexNumber() {
        return indexNumber;
    }

    public void setIndexNumber(String indexNumber) {
        this.indexNumber = indexNumber;
    }

    public Integer getYearOfEnrollment() {
        return yearOfEnrollment;
    }

    public void setYearOfEnrollment(Integer yearOfEnrollment) {
        this.yearOfEnrollment = yearOfEnrollment;
    }

    public LocalDate getDateOfEnrollment() {
        return dateOfEnrollment;
    }

    public void setDateOfEnrollment(LocalDate dateOfEnrollment) {
        this.dateOfEnrollment = dateOfEnrollment;
    }

    public Long getStudyProgramId() {
        return studyProgramId;
    }

    public void setStudyProgramId(Long studyProgramId) {
        this.studyProgramId = studyProgramId;
    }
}