package com.university.lms.service;

import com.university.lms.entity.Syllabus;
import com.university.lms.repository.SyllabusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SyllabusService {
    @Autowired
    private SyllabusRepository syllabusRepository;
    
    public SyllabusService(SyllabusRepository syllabusRepository) {
        this.syllabusRepository = syllabusRepository;
    }

    public List<Syllabus> getAllSyllabuses() {
        return syllabusRepository.findAll();
    }

    public Syllabus saveSyllabus(Syllabus syllabus) {
        return syllabusRepository.save(syllabus);
    }

    public Syllabus updateSyllabus(Long id, String content) {
        Syllabus syllabus = syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus not found"));
        syllabus.setContent(content);
        return syllabusRepository.save(syllabus);
    }

    public Syllabus importSyllabus(Syllabus syllabus) {
        return syllabusRepository.save(syllabus);
    }
    
    public Optional<Syllabus> getSyllabusesByCourse(Long courseId) {
        return syllabusRepository.findByCourseId(courseId);
    }

    public Syllabus createSyllabus(Syllabus syllabus) {
    	syllabus.setId(null);
        return syllabusRepository.save(syllabus);
    }

    public Syllabus updateSyllabus(Long id, Syllabus updatedSyllabus) {
        Syllabus syllabus = syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus not found: " + id));
        syllabus.setCourseId(updatedSyllabus.getCourseId());
        syllabus.setContent(updatedSyllabus.getContent());
        syllabus.setAcademicYear(updatedSyllabus.getAcademicYear());
        return syllabusRepository.save(syllabus);
    }

    public void deleteSyllabus(Long id) {
        if (!syllabusRepository.existsById(id)) {
            throw new RuntimeException("Syllabus not found: " + id);
        }
        syllabusRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return syllabusRepository.existsById(id);
    }
}