package com.university.lms.repository;

import com.university.lms.entity.WeeklySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WeeklyScheduleRepository extends JpaRepository<WeeklySchedule, Long> {
    List<WeeklySchedule> findByStudyProgramIdAndYear(Long studyProgramId, Integer year);
}