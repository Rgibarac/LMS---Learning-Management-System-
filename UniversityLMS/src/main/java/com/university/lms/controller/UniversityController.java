package com.university.lms.controller;

import com.university.lms.entity.University;
import com.university.lms.repository.UniversityRepository;
import com.university.lms.service.UniversityService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class UniversityController {
    @Autowired
    private UniversityRepository universityRepository;

    @GetMapping("/university")
    public ResponseEntity<University> getUniversityInfo() {
        return universityRepository.findById(1L)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @Autowired
    private UniversityService universityService;

    @GetMapping("/university/get")
    public ResponseEntity<List<University>> getAllUniversitiesPublic() {
        return ResponseEntity.ok(universityService.getAllUniversities());
    }

    @GetMapping
    public ResponseEntity<List<University>> getAllUniversities() {
        return ResponseEntity.ok(universityService.getAllUniversities());
    }


    @GetMapping("/university/{id}")
    public ResponseEntity<University> getUniversityById(@PathVariable Long id) {
        return universityService.getUniversityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/university")
    public ResponseEntity<University> createUniversity(@RequestBody University university) {
        University created = universityService.createUniversity(university);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/university/{id}")
    public ResponseEntity<University> updateUniversity(@PathVariable Long id, @RequestBody University university) {
        if (!universityService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        University updated = universityService.updateUniversity(id, university);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/university/{id}")
    public ResponseEntity<Void> deleteUniversity(@PathVariable Long id) {
        if (!universityService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        universityService.deleteUniversity(id);
        return ResponseEntity.noContent().build();
    }
}