package com.university.lms.dto;

public class ExamApplicationRequestDTO {
    private Long userId;
    private Long courseId;
    private String term;

    public ExamApplicationRequestDTO() {}

    public ExamApplicationRequestDTO(Long userId, Long courseId, String term) {
        this.userId = userId;
        this.courseId = courseId;
        this.term = term;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }
}