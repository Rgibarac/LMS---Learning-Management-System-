package com.university.lms.controller;

import com.university.lms.dto.UserDTO;
import com.university.lms.entity.*;
import com.university.lms.repository.*;
import com.university.lms.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
public class EnrollmentController {
    @Autowired
    private EnrollmentService enrollmentService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private StudyProgramRepository studyProgramRepository;

    @PostMapping("/enroll/course")
    public ResponseEntity<UserDTO> enrollStudentInCourse(@RequestBody EnrollmentRequest request) {
        if (!userRepository.existsById(request.getStudentId()) || !courseRepository.existsById(request.getCourseId())) {
            return ResponseEntity.notFound().build();
        }
        User student = userRepository.findById(request.getStudentId()).orElse(null);
        if (student == null || !"STUDENT".equals(student.getRole())) {
            return ResponseEntity.badRequest().build();
        }
        enrollmentService.saveCourseEnrollment(request.getStudentId(), request.getCourseId());
        return ResponseEntity.ok(createUserDTO(student));
    }

    @PostMapping("/enroll/study-program")
    public ResponseEntity<UserDTO> enrollStudentInStudyProgram(@RequestBody EnrollmentRequest request) {
        if (!userRepository.existsById(request.getStudentId()) || !studyProgramRepository.existsById(request.getStudyProgramId())) {
            return ResponseEntity.notFound().build();
        }
        User student = userRepository.findById(request.getStudentId()).orElse(null);
        if (student == null || !"STUDENT".equals(student.getRole())) {
            return ResponseEntity.badRequest().build();
        }
        enrollmentService.saveStudyProgramEnrollment(request.getStudentId(), request.getStudyProgramId());
        return ResponseEntity.ok(createUserDTO(student));
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
}

