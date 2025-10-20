package com.university.lms.controller;

import com.university.lms.entity.Evaluation;
import com.university.lms.entity.User;
import com.university.lms.repository.EvaluationRepository;
import com.university.lms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    public EvaluationController(EvaluationRepository evaluationRepository, UserRepository userRepository) {
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Evaluation>> getAllEvaluations() {
        return ResponseEntity.ok(evaluationRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Evaluation> saveEvaluation(@RequestBody Evaluation evaluation) {
        return ResponseEntity.ok(evaluationRepository.save(evaluation));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Evaluation>> findByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(evaluationRepository.findByCourseId(courseId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Evaluation>> findByType(@PathVariable String type) {
        return ResponseEntity.ok(evaluationRepository.findAll().stream()
                .filter(e -> e.getType().equalsIgnoreCase(type))
                .toList());
    }

    @PostMapping("/{evaluationId}/grade")
    public ResponseEntity<Evaluation> assignGrade(@PathVariable Long evaluationId,
                                                 @RequestBody GradeRequest request) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        evaluation.getStudentGrades().put(student, request.getGrade());
        return ResponseEntity.ok(evaluationRepository.save(evaluation));
    }
}

class GradeRequest {
    private Long studentId;
    private Double grade;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }
}