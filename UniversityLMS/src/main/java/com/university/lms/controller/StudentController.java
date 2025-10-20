package com.university.lms.controller;

import com.university.lms.entity.Course;
import com.university.lms.entity.Evaluation;
import com.university.lms.entity.ExamRegistration;
import com.university.lms.service.StudentService;
import com.university.lms.service.StudyHistoryDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/courses/{userId}")
    public ResponseEntity<List<Course>> getStudentCourses(@PathVariable Long userId) {
        return ResponseEntity.ok(studentService.getStudentCourses(userId));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<StudyHistoryDTO>> getStudentHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(studentService.getStudentHistory(userId));
    }

    @GetMapping("/exams/{userId}")
    public ResponseEntity<List<Evaluation>> getAvailableExams(@PathVariable Long userId) {
        return ResponseEntity.ok(studentService.getAvailableExams(userId));
    }

    @PostMapping("/exams/register")
    public ResponseEntity<ExamRegistration> registerForExam(@RequestBody ExamRegistrationRequest request) {
        return ResponseEntity.ok(studentService.registerForExam(request.getUserId(), request.getEvaluationId()));
    }
}