package com.university.lms.controller;

import com.university.lms.entity.StudyProgram;
import com.university.lms.service.StudyProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/study-programs")
public class StudyProgramController {

    @Autowired
    private StudyProgramService studyProgramService;

    @GetMapping("/all")
    public ResponseEntity<List<StudyProgram>> getStudyPrograms() {
        return ResponseEntity.ok(studyProgramService.findAll());
    }

    @GetMapping
    public ResponseEntity<List<StudyProgram>> getAllStudyPrograms() {
        return ResponseEntity.ok(studyProgramService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyProgram> getStudyProgramById(@PathVariable Long id) {
        return studyProgramService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StudyProgram> createStudyProgram(@RequestBody StudyProgram studyProgram) {
        StudyProgram created = studyProgramService.createStudyProgram(studyProgram);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyProgram> updateStudyProgram(@PathVariable Long id, @RequestBody StudyProgram studyProgram) {
        if (!studyProgramService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        StudyProgram updated = studyProgramService.updateStudyProgram(id, studyProgram);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudyProgram(@PathVariable Long id) {
        if (!studyProgramService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studyProgramService.deleteStudyProgram(id);
        return ResponseEntity.noContent().build();
    }
}