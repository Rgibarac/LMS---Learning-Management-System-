package com.university.lms.controller;

import com.university.lms.entity.University;
import com.university.lms.repository.UniversityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
}