package com.university.lms.repository;

import com.university.lms.entity.YearEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YearEnrollmentRepository extends JpaRepository<YearEnrollment, Long> {

    List<YearEnrollment> findByIndexNumber(String indexNumber);

    List<YearEnrollment> findByYearOfEnrollment(Integer year);
}