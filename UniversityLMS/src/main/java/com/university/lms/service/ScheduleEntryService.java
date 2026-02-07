package com.university.lms.service;

import com.university.lms.entity.ScheduleEntry;
import com.university.lms.entity.WeeklySchedule;
import com.university.lms.repository.ScheduleEntryRepository;
import com.university.lms.repository.WeeklyScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleEntryService {

    @Autowired
    private ScheduleEntryRepository entryRepository;

    @Autowired
    private WeeklyScheduleRepository scheduleRepository;

    public ScheduleEntry create(ScheduleEntry entry) {
        return entryRepository.save(entry);
    }

    public List<ScheduleEntry> getByScheduleId(Long scheduleId) {
        return entryRepository.findByWeeklyScheduleId(scheduleId);
    }

    public ScheduleEntry update(Long id, ScheduleEntry details) {
        ScheduleEntry entry = entryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found"));

        entry.setCourseId(details.getCourseId());
        entry.setDayOfWeek(details.getDayOfWeek());
        entry.setStartTime(details.getStartTime());
        entry.setEndTime(details.getEndTime());
        entry.setDescription(details.getDescription());
        entry.setLocation(details.getLocation());

        return entryRepository.save(entry);
    }

    public void delete(Long id) {
        entryRepository.deleteById(id);
    }
}