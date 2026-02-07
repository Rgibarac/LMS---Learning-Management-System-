// src/main/java/com/university/lms/repository/UniversityDetailsRepository.java

package com.university.lms.repository;

import com.university.lms.entity.UniversityDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityDetailsRepository extends JpaRepository<UniversityDetails, Long> {
    Optional<UniversityDetails> findByUniversityId(Long universityId);
}