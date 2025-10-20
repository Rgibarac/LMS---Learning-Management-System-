package com.university.lms.repository;

import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamApplicationRepository extends JpaRepository<ExamApplication, Long> {
    List<ExamApplication> findByUser(User user);
}