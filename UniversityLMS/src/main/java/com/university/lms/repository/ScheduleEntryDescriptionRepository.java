package com.university.lms.repository;

import com.university.lms.entity.ScheduleEntryDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScheduleEntryDescriptionRepository extends JpaRepository<ScheduleEntryDescription, Long> {
    List<ScheduleEntryDescription> findByScheduleEntryId(Long scheduleEntryId);
}