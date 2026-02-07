package com.university.lms.service;

import com.university.lms.entity.YearEnrollment;
import com.university.lms.repository.YearEnrollmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class YearEnrollmentService {

    private static final Logger logger = LoggerFactory.getLogger(YearEnrollmentService.class);

    @Autowired
    private YearEnrollmentRepository yearEnrollmentRepository;

    public YearEnrollment createEnrollment(YearEnrollment enrollment) {
        logger.info("Creating year enrollment for index: {}", enrollment.getIndexNumber());
        return yearEnrollmentRepository.save(enrollment);
    }

    public List<YearEnrollment> getAllEnrollments() {
        logger.info("Fetching all year enrollments");
        return yearEnrollmentRepository.findAll();
    }

    public Optional<YearEnrollment> getEnrollmentById(Long id) {
        logger.info("Fetching enrollment with id: {}", id);
        return yearEnrollmentRepository.findById(id);
    }

    public List<YearEnrollment> getEnrollmentsByIndex(String indexNumber) {
        return yearEnrollmentRepository.findByIndexNumber(indexNumber);
    }

    public YearEnrollment updateEnrollment(Long id, YearEnrollment enrollmentDetails) {
        logger.info("Updating enrollment with id: {}", id);
        YearEnrollment enrollment = yearEnrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));

        enrollment.setIndexNumber(enrollmentDetails.getIndexNumber());
        enrollment.setYearOfEnrollment(enrollmentDetails.getYearOfEnrollment());
        enrollment.setDateOfEnrollment(enrollmentDetails.getDateOfEnrollment());
        enrollment.setStudyProgramId(enrollmentDetails.getStudyProgramId());

        return yearEnrollmentRepository.save(enrollment);
    }

    public void deleteEnrollment(Long id) {
        logger.info("Deleting enrollment with id: {}", id);
        if (!yearEnrollmentRepository.existsById(id)) {
            throw new RuntimeException("Enrollment not found with id: " + id);
        }
        yearEnrollmentRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return yearEnrollmentRepository.existsById(id);
    }
}