package com.university.lms.service;

import com.university.lms.entity.Course;
import com.university.lms.entity.Exam;
import com.university.lms.entity.User;
import com.university.lms.repository.CourseRepository;
import com.university.lms.repository.ExamRepository;
import com.university.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
public class ExamService {
    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Exam saveExam(Exam exam) {
        return examRepository.save(exam);
    }

    public List<Exam> findByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return examRepository.findByCourse(course);
    }

    public List<Exam> findByDateBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return examRepository.findByDateBetween(startDate, endDate);
    }

    public Exam registerStudentForExam(Long examId, Long studentId, Double grade) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (!"STUDENT".equals(student.getRole())) {
            throw new RuntimeException("Only students can be registered for exams");
        }

        if (exam.getStudentGrades() == null) {
            exam.setStudentGrades(new HashMap<>());
        }

        exam.getStudentGrades().put(student, grade);
        return examRepository.save(exam);
    }
}