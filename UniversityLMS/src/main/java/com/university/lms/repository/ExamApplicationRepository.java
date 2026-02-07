package com.university.lms.repository;

import com.university.lms.entity.Course;
import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamApplicationRepository extends JpaRepository<ExamApplication, Long> {
    List<ExamApplication> findByUser(User user);
    List<ExamApplication> findByUserId(Long userId);
    long countByUserId(Long userId);
    Optional<ExamApplication> findByUserAndCourseAndTerm(User user, Course course, String term);
}