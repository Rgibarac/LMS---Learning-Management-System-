package com.university.lms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "course_tasks")
public class CourseTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    // Constructors
    public CourseTask() {}

    public CourseTask(String name, String description, Long courseId) {
        this.name = name;
        this.description = description;
        this.courseId = courseId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
}