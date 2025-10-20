package com.university.lms.repository;

import com.university.lms.entity.ExamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {
    List<ExamRegistration> findByUserId(Long userId);
    boolean existsByUserIdAndEvaluationId(Long userId, Long evaluationId);
}