package com.university.lms.repository;

import com.university.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStudyProgramId(Long studyProgramId);
    
    List<Course> findByStudyYear(Long studyYear);
    List<Course> findByTeacherId(Long teacherId);
    List<Course> findByStudyYearAndTeacherId(Long studyYear, Long teacherId);
    Optional<Course> findByIdAndTeacherId(Long courseId, Long teacherId);
}