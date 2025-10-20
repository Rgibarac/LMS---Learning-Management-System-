package com.university.lms.dto;

public class ExamApplicationResponseDTO {
    private Long id;
    private UserDTO user;
    private CourseDTO course;
    private String term;

    public ExamApplicationResponseDTO() {}

    public ExamApplicationResponseDTO(Long id, UserDTO user, CourseDTO course, String term) {
        this.id = id;
        this.user = user;
        this.course = course;
        this.term = term;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }
    public CourseDTO getCourse() { return course; }
    public void setCourse(CourseDTO course) { this.course = course; }
    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }
}