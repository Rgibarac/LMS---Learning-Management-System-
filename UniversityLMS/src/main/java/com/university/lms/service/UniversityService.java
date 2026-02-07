package com.university.lms.service;

import com.university.lms.entity.University;
import com.university.lms.repository.UniversityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UniversityService {

    private static final Logger logger = LoggerFactory.getLogger(UniversityService.class);

    @Autowired
    private UniversityRepository universityRepository;

    public University createUniversity(University university) {
        logger.info("Creating new university: {}", university.getName());
        return universityRepository.save(university);
    }

    public List<University> getAllUniversities() {
        logger.info("Fetching all universities");
        return universityRepository.findAll();
    }

    public Optional<University> getUniversityById(Long id) {
        logger.info("Fetching university with id: {}", id);
        return universityRepository.findById(id);
    }

    public University updateUniversity(Long id, University universityDetails) {
        logger.info("Updating university with id: {}", id);
        University university = universityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("University not found with id: " + id));

        university.setName(universityDetails.getName());
        university.setDescription(universityDetails.getDescription());

        return universityRepository.save(university);
    }

    public void deleteUniversity(Long id) {
        logger.info("Deleting university with id: {}", id);
        if (!universityRepository.existsById(id)) {
            throw new RuntimeException("University not found with id: " + id);
        }
        universityRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return universityRepository.existsById(id);
    }
}