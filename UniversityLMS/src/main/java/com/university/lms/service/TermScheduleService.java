package com.university.lms.service;

import com.university.lms.entity.TermSchedule;
import com.university.lms.repository.TermScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TermScheduleService {

    private final TermScheduleRepository repository;

    public TermSchedule create(TermSchedule schedule) {
        validateSchedule(schedule);
        return repository.save(schedule);
    }

    public TermSchedule update(Long id, TermSchedule updated) {
        TermSchedule existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        existing.setName(updated.getName());
        existing.setTermId(updated.getTermId());
        existing.setLocation(updated.getLocation());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.getCourses().clear();
        existing.getCourses().addAll(updated.getCourses());

        validateSchedule(existing);
        return repository.save(existing);
    }

    public List<TermSchedule> getByTerm(Long termId) {
        return repository.findByTermIdOrderByDateAscStartTimeAsc(termId);
    }

    public List<TermSchedule> getWeekly(Long termId, LocalDate startOfWeek) {
        LocalDate endOfWeek = startOfWeek.plusDays(6);
        return repository.findByTermIdAndDateBetween(termId, startOfWeek, endOfWeek);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    private void validateSchedule(TermSchedule s) {
        if (s.getName() == null || s.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Schedule name is required");
        }
        if (s.getDate() == null || s.getStartTime() == null) {
            throw new IllegalArgumentException("Date and start time are required");
        }
        if (s.getCourses().isEmpty()) {
            throw new IllegalArgumentException("At least one course must be assigned");
        }
    }
}