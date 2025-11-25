package com.university.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "term_schedules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TermSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "term_id", nullable = false)
    private Long termId;

    private String location;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    private LocalTime endTime;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "term_schedule_courses",
        joinColumns = @JoinColumn(name = "schedule_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();

}