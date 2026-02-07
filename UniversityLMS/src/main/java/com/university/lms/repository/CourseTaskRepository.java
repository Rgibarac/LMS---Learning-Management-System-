package com.university.lms.repository;

import com.university.lms.entity.CourseTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseTaskRepository extends JpaRepository<CourseTask, Long> {
    List<CourseTask> findByCourseId(Long courseId);
}