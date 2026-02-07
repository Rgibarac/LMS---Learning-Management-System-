// src/main/java/com/university/lms/controller/UniversityDetailsController.java

package com.university.lms.controller;

import com.university.lms.entity.UniversityDetails;
import com.university.lms.service.UniversityDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/university-details")
@CrossOrigin(origins = "http://localhost:4200")
public class UniversityDetailsController {

    @Autowired
    private UniversityDetailsService service;

    // PUBLIC - Get main university details (for home page)
    @GetMapping("/public")
    public ResponseEntity<UniversityDetails> getPublicDetails() {
        return service.getPublicDetails()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN - Get all (in case of multiple)
    @GetMapping
    public List<UniversityDetails> getAll() {
        return service.getAll();
    }

    // ADMIN - Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<UniversityDetails> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ADMIN - Create / Update (same endpoint)
    @PostMapping
    public UniversityDetails create(@RequestBody UniversityDetails details) {
        return service.saveOrUpdate(details);
    }

    @PutMapping("/{id}")
    public UniversityDetails update(@PathVariable Long id, @RequestBody UniversityDetails details) {
        details.setId(id);
        return service.saveOrUpdate(details);
    }

    // ADMIN - Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}