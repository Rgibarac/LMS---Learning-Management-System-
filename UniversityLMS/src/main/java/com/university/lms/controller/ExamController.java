package com.university.lms.controller;

import com.university.lms.entity.Exam;
import com.university.lms.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ExamController {
    @Autowired
    private ExamService examService;

    @GetMapping("/public/exams")
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @PostMapping("/admin/exams")
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        return ResponseEntity.ok(examService.saveExam(exam));
    }

    @GetMapping("/public/exams/course/{courseId}")
    public ResponseEntity<List<Exam>> getExamsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(examService.findByCourse(courseId));
    }

    @GetMapping("/public/exams/date-range")
    public ResponseEntity<List<Exam>> getExamsByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        return ResponseEntity.ok(examService.findByDateBetween(startDate, endDate));
    }

    @PostMapping("/student/exams/{examId}/register")
    public ResponseEntity<Exam> registerStudentForExam(
            @PathVariable Long examId,
            @RequestParam Long studentId,
            @RequestParam Double grade) {
        return ResponseEntity.ok(examService.registerStudentForExam(examId, studentId, grade));
    }
}