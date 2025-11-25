package com.university.lms.repository;

import com.university.lms.entity.AppliedYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppliedYearRepository extends JpaRepository<AppliedYear, Long> {

    List<AppliedYear> findByUserIdOrderByYearAsc(Long userId);

    Optional<AppliedYear> findByUserIdAndYear(Long userId, Integer year);

    List<AppliedYear> findByStudyProgramId(Long studyProgramId);

    boolean existsByUserIdAndYear(Long userId, Integer year);

    Optional<AppliedYear> findTopByUserIdOrderByYearDesc(Long userId);
}