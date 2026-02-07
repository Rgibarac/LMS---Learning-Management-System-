package com.university.lms.controller;

import com.university.lms.entity.ScheduleEntry;
import com.university.lms.service.ScheduleEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule-entries")
@CrossOrigin(origins = "http://localhost:4200")
public class ScheduleEntryController {

    @Autowired
    private ScheduleEntryService service;

    @PostMapping
    public ScheduleEntry create(@RequestBody ScheduleEntry entry) {
        return service.create(entry);
    }

    @GetMapping("/schedule/{scheduleId}")
    public List<ScheduleEntry> getBySchedule(@PathVariable Long scheduleId) {
        return service.getByScheduleId(scheduleId);
    }

    @PutMapping("/{id}")
    public ScheduleEntry update(@PathVariable Long id, @RequestBody ScheduleEntry entry) {
        return service.update(id, entry);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}