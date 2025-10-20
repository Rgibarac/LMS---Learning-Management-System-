package com.university.lms.dto;

public class ExamGradeResponseDTO {
    private Long id;
    private ExamApplicationResponseDTO examApplication;
    private float grade;
    private int numberOfTakenExams;

    public ExamGradeResponseDTO() {}

    public ExamGradeResponseDTO(Long id, ExamApplicationResponseDTO examApplication, float grade, int numberOfTakenExams) {
        this.id = id;
        this.examApplication = examApplication;
        this.grade = grade;
        this.numberOfTakenExams = numberOfTakenExams;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ExamApplicationResponseDTO getExamApplication() { return examApplication; }
    public void setExamApplication(ExamApplicationResponseDTO examApplication) { this.examApplication = examApplication; }
    public float getGrade() { return grade; }
    public void setGrade(float grade) { this.grade = grade; }
    public int getNumberOfTakenExams() { return numberOfTakenExams; }
    public void setNumberOfTakenExams(int numberOfTakenExams) { this.numberOfTakenExams = numberOfTakenExams; }
}