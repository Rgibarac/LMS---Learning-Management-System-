package com.university.lms.service;

import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.User;
import com.university.lms.entity.Course;
import com.university.lms.repository.ExamApplicationRepository;
import com.university.lms.repository.UserRepository;
import com.university.lms.repository.ExamGradeRepository;

import jakarta.transaction.Transactional;

import com.university.lms.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamApplicationService {
    @Autowired
    private ExamApplicationRepository examApplicationRepository;
    @Autowired
    private ExamGradeRepository examGradeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;

    public ExamApplication createExamApplication(Long userId, Long courseId, String term) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        if (term == null || term.trim().isEmpty()) {
            throw new IllegalArgumentException("Term cannot be empty");
        }
        ExamApplication examApplication = new ExamApplication(user, course, term);
        return examApplicationRepository.save(examApplication);
    }

    public List<ExamApplication> getExamApplicationsByUserId(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        return examApplicationRepository.findByUser(user);
    }

    public List<ExamApplication> getAllExamApplications() {
        return examApplicationRepository.findAll();
    }

    @Transactional
    public void deleteExamApplication(Long id) {
        ExamApplication examApplication = examApplicationRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Exam application not found: " + id));
        examGradeRepository.findByExamApplication(examApplication)
            .forEach(examGradeRepository::delete);
        examApplicationRepository.deleteById(id);
    }
}