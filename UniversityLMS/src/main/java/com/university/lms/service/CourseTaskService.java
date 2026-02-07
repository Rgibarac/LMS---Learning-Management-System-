package com.university.lms.service;

import com.university.lms.entity.CourseTask;
import com.university.lms.repository.CourseTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseTaskService {

    @Autowired
    private CourseTaskRepository repository;

    public CourseTask create(CourseTask task) {
        return repository.save(task);
    }

    public List<CourseTask> getAll() {
        return repository.findAll();
    }

    public List<CourseTask> getByCourseId(Long courseId) {
        return repository.findByCourseId(courseId);
    }

    public CourseTask update(Long id, CourseTask details) {
        CourseTask task = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setName(details.getName());
        task.setDescription(details.getDescription());
        return repository.save(task);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}