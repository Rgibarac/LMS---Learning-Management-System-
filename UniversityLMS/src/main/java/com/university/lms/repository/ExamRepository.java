package com.university.lms.repository;

import com.university.lms.entity.Exam;
import com.university.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourse(Course course);

    List<Exam> findByDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}