package com.university.lms.dto;

public class ExamGradeRequestDTO {
    private Long examApplicationId;
    private float grade;
    private int numberOfTakenExams;

    public ExamGradeRequestDTO() {}

    public ExamGradeRequestDTO(Long examApplicationId, float grade, int numberOfTakenExams) {
        this.examApplicationId = examApplicationId;
        this.grade = grade;
        this.numberOfTakenExams = numberOfTakenExams;
    }

    public Long getExamApplicationId() { return examApplicationId; }
    public void setExamApplicationId(Long examApplicationId) { this.examApplicationId = examApplicationId; }
    public float getGrade() { return grade; }
    public void setGrade(float grade) { this.grade = grade; }
    public int getNumberOfTakenExams() { return numberOfTakenExams; }
    public void setNumberOfTakenExams(int numberOfTakenExams) { this.numberOfTakenExams = numberOfTakenExams; }
}