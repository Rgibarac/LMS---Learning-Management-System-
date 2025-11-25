package com.university.lms.controller;

import com.university.lms.entity.Term;
import com.university.lms.service.TermService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terms")
@RequiredArgsConstructor
public class TermController {

    private final TermService termService;

    @GetMapping
    public ResponseEntity<List<Term>> getAllTerms() {
        return ResponseEntity.ok(termService.getAllTerms());
    }

    @GetMapping("/current")
    public ResponseEntity<Term> getCurrentTerm() {
        return ResponseEntity.ok(termService.getCurrentTerm());
    }

    @GetMapping("/active")
    public ResponseEntity<Term> getActiveTerm() {
        return ResponseEntity.ok(termService.getActiveTerm());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Term> getTerm(@PathVariable Long id) {
        return ResponseEntity.ok(termService.getTermById(id));
    }


    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Term> createTerm(@RequestBody Term term) {
        return ResponseEntity.ok(termService.createTerm(term));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Term> updateTerm(@PathVariable Long id, @RequestBody Term term) {
        return ResponseEntity.ok(termService.updateTerm(id, term));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> deleteTerm(@PathVariable Long id) {
        termService.deleteTerm(id);
        return ResponseEntity.ok().build();
    }
}