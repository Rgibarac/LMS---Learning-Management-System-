package com.university.lms.controller;

import com.university.lms.entity.StudyProgram;
import com.university.lms.repository.StudyProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/public")
public class StudyProgramController {
    @Autowired
    private StudyProgramRepository studyProgramRepository;

    @GetMapping("/study-programs")
    public ResponseEntity<List<StudyProgram>> getStudyPrograms() {
        return ResponseEntity.ok(studyProgramRepository.findAll());
    }
}