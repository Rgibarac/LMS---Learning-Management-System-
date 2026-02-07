package com.university.lms.controller;

import com.university.lms.entity.YearEnrollment;
import com.university.lms.service.YearEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/year-enrollments")
@CrossOrigin(origins = "http://localhost:4200")
public class YearEnrollmentController {

    @Autowired
    private YearEnrollmentService yearEnrollmentService;

    @PostMapping
    public ResponseEntity<YearEnrollment> createEnrollment(@RequestBody YearEnrollment enrollment) {
        YearEnrollment created = yearEnrollmentService.createEnrollment(enrollment);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<YearEnrollment>> getAllEnrollments() {
        return ResponseEntity.ok(yearEnrollmentService.getAllEnrollments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<YearEnrollment> getEnrollmentById(@PathVariable Long id) {
        return yearEnrollmentService.getEnrollmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{indexNumber}")
    public ResponseEntity<List<YearEnrollment>> getEnrollmentsByIndex(@PathVariable String indexNumber) {
        List<YearEnrollment> enrollments = yearEnrollmentService.getEnrollmentsByIndex(indexNumber);
        return ResponseEntity.ok(enrollments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<YearEnrollment> updateEnrollment(@PathVariable Long id, @RequestBody YearEnrollment enrollment) {
        if (!yearEnrollmentService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        YearEnrollment updated = yearEnrollmentService.updateEnrollment(id, enrollment);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        if (!yearEnrollmentService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        yearEnrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}