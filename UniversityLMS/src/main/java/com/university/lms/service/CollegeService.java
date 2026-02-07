package com.university.lms.service;

import com.university.lms.entity.College;
import com.university.lms.repository.CollegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CollegeService {

    @Autowired
    private CollegeRepository collegeRepository;

    public College createCollege(College college) {
        return collegeRepository.save(college);
    }

    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    public Optional<College> getCollegeById(Long id) {
        return collegeRepository.findById(id);
    }

    public Optional<College> getCollegeByName(String name) {
        return collegeRepository.findByName(name);
    }

    public College updateCollege(Long id, College collegeDetails) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("College not found with id: " + id));

        college.setName(collegeDetails.getName());
        college.setDeanId(collegeDetails.getDeanId());
        college.setAddress(collegeDetails.getAddress());
        college.setUniversityName(collegeDetails.getUniversityName());

        return collegeRepository.save(college);
    }

    public void deleteCollege(Long id) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("College not found with id: " + id));
        collegeRepository.delete(college);
    }
}