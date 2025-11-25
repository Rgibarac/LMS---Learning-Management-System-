package com.university.lms.repository;

import com.university.lms.entity.TermSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TermScheduleRepository extends JpaRepository<TermSchedule, Long> {

    List<TermSchedule> findByTermId(Long termId);

    List<TermSchedule> findByTermIdAndDateBetween(Long termId, LocalDate start, LocalDate end);

    @Query("SELECT ts FROM TermSchedule ts JOIN ts.courses c WHERE c.id = :courseId")
    List<TermSchedule> findByCourseId(Long courseId);

    List<TermSchedule> findByTermIdOrderByDateAscStartTimeAsc(Long termId);
}