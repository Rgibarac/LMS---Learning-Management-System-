package com.university.lms.controller;

import com.university.lms.entity.CourseTask;
import com.university.lms.service.CourseTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class CourseTaskController {

    @Autowired
    private CourseTaskService service;

    @PostMapping
    public CourseTask create(@RequestBody CourseTask task) {
        return service.create(task);
    }

    @GetMapping
    public List<CourseTask> getAll() {
        return service.getAll();
    }

    @GetMapping("/course/{courseId}")
    public List<CourseTask> getByCourse(@PathVariable Long courseId) {
        return service.getByCourseId(courseId);
    }

    @PutMapping("/{id}")
    public CourseTask update(@PathVariable Long id, @RequestBody CourseTask task) {
        return service.update(id, task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}