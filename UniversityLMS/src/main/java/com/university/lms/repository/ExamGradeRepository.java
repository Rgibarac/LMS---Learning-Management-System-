package com.university.lms.repository;

import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.ExamGrade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamGradeRepository extends JpaRepository<ExamGrade, Long> {
    List<ExamGrade> findByExamApplication(ExamApplication examApplication);
}