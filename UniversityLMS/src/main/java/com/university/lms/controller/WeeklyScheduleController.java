package com.university.lms.controller;

import com.university.lms.entity.WeeklySchedule;
import com.university.lms.service.WeeklyScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weekly-schedules")
@CrossOrigin(origins = "http://localhost:4200")
public class WeeklyScheduleController {

    @Autowired
    private WeeklyScheduleService service;

    @PostMapping
    public WeeklySchedule create(@RequestBody WeeklySchedule schedule) {
        return service.create(schedule);
    }

    @GetMapping
    public List<WeeklySchedule> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklySchedule> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/program/{programId}/year/{year}")
    public List<WeeklySchedule> getByProgramAndYear(@PathVariable Long programId, @PathVariable Integer year) {
        return service.getByProgramAndYear(programId, year);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}