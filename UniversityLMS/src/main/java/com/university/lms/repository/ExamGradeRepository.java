package com.university.lms.repository;

import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.ExamGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamGradeRepository extends JpaRepository<ExamGrade, Long> {
    List<ExamGrade> findByExamApplication(ExamApplication examApplication);
    @Query("SELECT eg FROM ExamGrade eg WHERE eg.examApplication.user.id = :userId")
    List<ExamGrade> findByExamApplicationUserId(@Param("userId") Long userId);
    List<ExamGrade> findByExamApplicationId(Long examApplicationId);
    @Query("SELECT AVG(eg.grade) FROM ExamGrade eg WHERE eg.examApplication.user.id = :userId")
    Double findAverageGradeByUserId(@Param("userId") Long userId);
}