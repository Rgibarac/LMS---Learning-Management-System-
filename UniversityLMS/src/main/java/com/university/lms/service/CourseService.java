package com.university.lms.service;

import com.university.lms.entity.Course;
import com.university.lms.entity.Syllabus;
import com.university.lms.repository.CourseRepository;
import com.university.lms.repository.SyllabusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.university.lms.entity.User;
import com.university.lms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SyllabusRepository syllabusRepository;   

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> findAll() {
        logger.info("Fetching all courses");
        return courseRepository.findAll();
    }

    public Optional<Course> findById(Long id) {
        logger.info("Fetching course with id: {}", id);
        return courseRepository.findById(id);
    }

    public Syllabus getSyllabus(Long courseId) {
        logger.info("Fetching syllabus for course id: {}", courseId);
        return syllabusRepository.findByCourseId(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Syllabus not found for course: " + courseId));
    }

    public void setSyllabus(Long courseId, Syllabus syllabus) {
        logger.info("Setting syllabus for course id: {}", courseId);
        syllabus.setCourseId(courseId);
        syllabusRepository.save(syllabus);
    }
    
    public List<Course> getCoursesByStudyProgram(Long studyProgramId) {
        return courseRepository.findByStudyProgramId(studyProgramId);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return courseRepository.existsById(id);
    }
    
    public Course createCourse(Course course, Long teacherId) {
        validateTeacher(teacherId);
        course.setTeacherId(teacherId);
        course.setId(null);
        return courseRepository.save(course);
    }
    
    public Course updateCourse(Long id, Course course, Long requestingUserId) {
        Course existing = courseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!isAdmin() && !existing.getTeacherId().equals(requestingUserId)) {
            throw new SecurityException("You can only edit your own courses");
        }

        if (course.getTeacherId() != null && !course.getTeacherId().equals(existing.getTeacherId())) {
            validateTeacher(course.getTeacherId());
            existing.setTeacherId(course.getTeacherId());
        }

        existing.setName(course.getName());
        existing.setDescription(course.getDescription());
        existing.setCode(course.getCode());
        existing.setEctsPoints(course.getEctsPoints());
        existing.setStudyProgramId(course.getStudyProgramId());
        existing.setStudyYear(course.getStudyYear());

        return courseRepository.save(existing);
    }

    public List<Course> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public List<Course> getCoursesByStudyYear(Long studyYear) {
        return courseRepository.findByStudyYear(studyYear);
    }

    private void validateTeacher(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!"TEACHER".equals(user.getRole())) {
            throw new IllegalArgumentException("User must have TEACHER role");
        }
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}