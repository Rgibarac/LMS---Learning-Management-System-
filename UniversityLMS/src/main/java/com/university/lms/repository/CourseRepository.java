package com.university.lms.repository;

import com.university.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStudyProgramId(Long studyProgramId);
}