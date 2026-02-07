package com.university.lms.service;

import com.university.lms.entity.ScheduleEntryDescription;
import com.university.lms.repository.ScheduleEntryDescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleEntryDescriptionService {

    @Autowired
    private ScheduleEntryDescriptionRepository repository;

    public ScheduleEntryDescription create(ScheduleEntryDescription desc) {
        return repository.save(desc);
    }

    public List<ScheduleEntryDescription> getAll() {
        return repository.findAll();
    }

    public List<ScheduleEntryDescription> getByScheduleEntryId(Long scheduleEntryId) {
        return repository.findByScheduleEntryId(scheduleEntryId);
    }

    public ScheduleEntryDescription update(Long id, ScheduleEntryDescription details) {
        ScheduleEntryDescription desc = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Description not found"));
        desc.setName(details.getName());
        desc.setDescription(details.getDescription());
        return repository.save(desc);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}