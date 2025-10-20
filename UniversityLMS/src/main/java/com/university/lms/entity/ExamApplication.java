package com.university.lms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "exam_applications")
public class ExamApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "term", nullable = false)
    private String term;

    public ExamApplication() {}

    public ExamApplication(User user, Course course, String term) {
        this.user = user;
        this.course = course;
        this.term = term;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }
}