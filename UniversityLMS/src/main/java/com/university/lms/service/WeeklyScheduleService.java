package com.university.lms.service;

import com.university.lms.entity.WeeklySchedule;
import com.university.lms.repository.WeeklyScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WeeklyScheduleService {

    @Autowired
    private WeeklyScheduleRepository repository;

    public WeeklySchedule create(WeeklySchedule schedule) {
        return repository.save(schedule);
    }

    public List<WeeklySchedule> getAll() {
        return repository.findAll();
    }

    public Optional<WeeklySchedule> getById(Long id) {
        return repository.findById(id);
    }

    public List<WeeklySchedule> getByProgramAndYear(Long programId, Integer year) {
        return repository.findByStudyProgramIdAndYear(programId, year);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}