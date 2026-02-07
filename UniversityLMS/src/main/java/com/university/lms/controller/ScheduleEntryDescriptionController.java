package com.university.lms.controller;

import com.university.lms.entity.ScheduleEntryDescription;
import com.university.lms.service.ScheduleEntryDescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule-entry-descriptions")
@CrossOrigin(origins = "http://localhost:4200")
public class ScheduleEntryDescriptionController {

    @Autowired
    private ScheduleEntryDescriptionService service;

    @PostMapping
    public ScheduleEntryDescription create(@RequestBody ScheduleEntryDescription desc) {
        return service.create(desc);
    }

    @GetMapping
    public List<ScheduleEntryDescription> getAll() {
        return service.getAll();
    }

    @GetMapping("/schedule-entry/{scheduleEntryId}")
    public List<ScheduleEntryDescription> getByScheduleEntry(@PathVariable Long scheduleEntryId) {
        return service.getByScheduleEntryId(scheduleEntryId);
    }

    @PutMapping("/{id}")
    public ScheduleEntryDescription update(@PathVariable Long id, @RequestBody ScheduleEntryDescription desc) {
        return service.update(id, desc);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}