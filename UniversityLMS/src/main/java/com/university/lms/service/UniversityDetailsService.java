// src/main/java/com/university/lms/service/UniversityDetailsService.java

package com.university.lms.service;

import com.university.lms.entity.University;
import com.university.lms.entity.UniversityDetails;
import com.university.lms.repository.UniversityDetailsRepository;
import com.university.lms.repository.UniversityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UniversityDetailsService {

    @Autowired
    private UniversityDetailsRepository detailsRepository;

    @Autowired
    private UniversityRepository universityRepository;

    public UniversityDetails saveOrUpdate(UniversityDetails details) {
        University university = universityRepository.findById(details.getId())
                .orElseThrow(() -> new RuntimeException("University not found with id: " + details.getId()));
        details.setUniversity(university);
        return detailsRepository.save(details);
    }

    public List<UniversityDetails> getAll() {
        return detailsRepository.findAll();
    }

    public Optional<UniversityDetails> getById(Long id) {
        return detailsRepository.findById(id);
    }

    public Optional<UniversityDetails> getPublicDetails() {
        return detailsRepository.findAll().stream().findFirst(); 
    }

    public void deleteById(Long id) {
        if (!detailsRepository.existsById(id)) {
            throw new RuntimeException("UniversityDetails not found with id: " + id);
        }
        detailsRepository.deleteById(id);
    }
}