package com.university.lms.service;

import com.university.lms.entity.Faculty;
import com.university.lms.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FacultyService {
    @Autowired
    private FacultyRepository facultyRepository;

    public List<Faculty> getAllFaculties() {
        return facultyRepository.findAll();
    }

    public Faculty saveFaculty(Faculty faculty) {
        return facultyRepository.save(faculty);
    }

    public List<Faculty> findByDean(String dean) {
        return facultyRepository.findByDean(dean);
    }

    public Faculty importFaculty(Faculty faculty) {
        return facultyRepository.save(faculty);
    }
}