package com.university.lms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "exams")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDateTime date;

    @ElementCollection
    @CollectionTable(name = "exam_grades", joinColumns = @JoinColumn(name = "exam_id"))
    @MapKeyJoinColumn(name = "user_id")
    @Column(name = "grade")
    private Map<User, Double> studentGrades; 

    private String evaluationResults; 
}