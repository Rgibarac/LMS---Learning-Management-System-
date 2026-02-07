package com.university.lms.repository;

import com.university.lms.entity.ScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {
    List<ScheduleEntry> findByWeeklyScheduleId(Long weeklyScheduleId);
}