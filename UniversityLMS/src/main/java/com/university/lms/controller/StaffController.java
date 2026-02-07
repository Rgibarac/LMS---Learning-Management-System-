package com.university.lms.controller;

import com.university.lms.dto.UserDTO;
import com.university.lms.entity.*;
import com.university.lms.repository.*;
import com.university.lms.service.EnrollmentService;
import com.university.lms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private StudyProgramRepository studyProgramRepository;
    @Autowired
    private SyllabusRepository syllabusRepository;
    @Autowired
    private NotificationService notificationService; 
    @Autowired
    private ScheduleRepository scheduleRepository;
    @Autowired
    private CustomContentRepository customContentRepository;
    @Autowired
    private EnrollmentService enrollmentService;


    @GetMapping("/students")
    public ResponseEntity<List<UserDTO>> searchStudents(@RequestParam(required = false) String query) {
        List<User> students = userRepository.findByRole("STUDENT");
        List<UserDTO> studentDTOs = students.stream()
            .map(this::createUserDTO)
            .collect(Collectors.toList());
        if (query != null && !query.trim().isEmpty()) {
            String lowerQuery = query.toLowerCase();
            studentDTOs = studentDTOs.stream()
                .filter(dto -> dto.getFirstName().toLowerCase().contains(lowerQuery) ||
                               dto.getLastName().toLowerCase().contains(lowerQuery) ||
                               (dto.getIndexNumber() != null && dto.getIndexNumber().toLowerCase().contains(lowerQuery)))
                .collect(Collectors.toList());
        }
        return ResponseEntity.ok(studentDTOs);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> ResponseEntity.ok(createUserDTO(user)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private UserDTO createUserDTO(User user) {
        UserDTO userDTO = new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getIndexNumber(),
            user.getRole()
        );
        List<Enrollment> enrollments = enrollmentService.findByStudentId(user.getId());
        userDTO.setEnrolledCourses(enrollments.stream()
            .filter(e -> e.getCourseId() != null)
            .map(e -> courseRepository.findById(e.getCourseId()).orElse(null))
            .filter(course -> course != null)
            .collect(Collectors.toList()));
        userDTO.setStudyProgram(enrollments.stream()
            .filter(e -> e.getStudyProgramId() != null)
            .map(e -> studyProgramRepository.findById(e.getStudyProgramId()).orElse(null))
            .filter(program -> program != null)
            .findFirst()
            .orElse(null));
        return userDTO;
    }
    

    
    @PostMapping("/notifications")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification savedNotification = notificationService.createNotification(notification);
        return ResponseEntity.status(201).body(savedNotification);
    }

   
    @PostMapping("/schedules")
    public ResponseEntity<Schedule> createSchedule(@RequestBody Schedule schedule) {
        if (!syllabusRepository.existsById(schedule.getSyllabusId())) {
            return ResponseEntity.notFound().build();
        }
        Syllabus syllabus = syllabusRepository.findById(schedule.getSyllabusId()).orElseThrow();
        Course course = courseRepository.findById(syllabus.getCourseId()).orElseThrow();
        schedule.setCourseName(course.getName());
        schedule.setAcademicYear(syllabus.getAcademicYear());
        schedule.setId(null);
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return ResponseEntity.status(201).body(savedSchedule);
    }

    @GetMapping("/schedules")
    public ResponseEntity<List<Schedule>> getSchedules() {
        return ResponseEntity.ok(scheduleRepository.findAll());
    }

    @PostMapping("/custom-content")
    public ResponseEntity<CustomContent> createCustomContent(@RequestBody CustomContent content) {
        content.setId(null);
        CustomContent savedContent = customContentRepository.save(content);
        return ResponseEntity.status(201).body(savedContent);
    }

    @GetMapping("/custom-content")
    public ResponseEntity<List<CustomContent>> getCustomContent() {
        return ResponseEntity.ok(customContentRepository.findAll());
    }
    
    @DeleteMapping("/custom-content/{id}")
    public ResponseEntity<Void> deleteCustomContent(@PathVariable Long id) {
        if (!customContentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        customContentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    
}

class EnrollmentRequest {
    private Long studentId;
    private Long courseId;
    private Long studyProgramId;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getStudyProgramId() { return studyProgramId; }
    public void setStudyProgramId(Long studyProgramId) { this.studyProgramId = studyProgramId; }
}