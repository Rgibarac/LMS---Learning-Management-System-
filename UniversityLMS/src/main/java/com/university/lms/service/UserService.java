package com.university.lms.service;

import com.university.lms.dto.UserDTO;
import com.university.lms.entity.Course;
import com.university.lms.entity.Enrollment;
import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.ExamGrade;
import com.university.lms.entity.StudyProgram;
import com.university.lms.entity.YearEnrollment;
import com.university.lms.entity.User;
import com.university.lms.repository.CourseRepository;
import com.university.lms.repository.EnrollmentRepository;
import com.university.lms.repository.ExamApplicationRepository;
import com.university.lms.repository.ExamGradeRepository;
import com.university.lms.repository.StudyProgramRepository;
import com.university.lms.repository.UserRepository;
import com.university.lms.repository.YearEnrollmentRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private YearEnrollmentRepository yearEnrollmentRepository;
    private EnrollmentService enrollmentService;
    private CourseRepository courseRepository;    
    private StudyProgramRepository studyProgramRepository;
    private final PasswordEncoder passwordEncoder;
    private EnrollmentRepository enrollmentRepository;
    private final ExamApplicationRepository examApplicationRepository;
    private final ExamGradeRepository examGradeRepository;
    

    @Autowired
    public UserService(UserRepository userRepository,
            YearEnrollmentRepository yearEnrollmentRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            StudyProgramRepository studyProgramRepository,
            EnrollmentService enrollmentService,
            PasswordEncoder passwordEncoder,
		    ExamApplicationRepository examApplicationRepository,
		    ExamGradeRepository examGradeRepository) {

this.userRepository = userRepository;
this.yearEnrollmentRepository = yearEnrollmentRepository;
this.enrollmentRepository = enrollmentRepository;
this.courseRepository = courseRepository;
this.studyProgramRepository = studyProgramRepository;
this.enrollmentService = enrollmentService;
this.passwordEncoder = passwordEncoder;
this.examApplicationRepository = examApplicationRepository;
this.examGradeRepository = examGradeRepository;
}
    
    
    
    
    public List<UserDTO> getAllUsersDTO() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::createUserDTO).collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(String role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream().map(this::createUserDTO).collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(this::createUserDTO);
    }

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
		this.examApplicationRepository = null;
		this.examGradeRepository = null;
    }

    public User register(User user) {
        logger.info("Registering user: {}", user.getUsername());
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            logger.error("Username already exists: {}", user.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        logger.info("User saved: {}", savedUser.getUsername());
        return savedUser;
    }

    public Optional<User> findByUsername(String username) {
        logger.info("Finding user by username: {}", username);
        return userRepository.findByUsername(username);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser( User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }
    
    
    
    public User createUser(User user) {
        user.setId(null); 
        return userRepository.save(user);
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
    public List<User> getAllTeachers() {
        return userRepository.findByRole("TEACHER");
    }
    
    
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public List<String> getEnrolledYearsAsStringList(Long studentId) {
        User student = findById(studentId);

        String indexNumber = student.getIndexNumber();
        if (indexNumber == null || indexNumber.isBlank()) {
            return List.of("No index number assigned");
        }

        return yearEnrollmentRepository.findByIndexNumber(indexNumber)
                .stream()
                .sorted((a, b) -> Integer.compare(b.getYearOfEnrollment(), a.getYearOfEnrollment())) 
                .map(ye -> {
                    String programName = studyProgramRepository.findById(ye.getStudyProgramId())
                            .map(StudyProgram::getName)
                            .orElse("Unknown Program");
                    return "Year " + ye.getYearOfEnrollment() + " – " + programName +
                           " (enrolled: " + ye.getDateOfEnrollment() + ")";
                })
                .collect(Collectors.toList());
    }

    public List<Course> getEnrolledCourses(Long studentId) {

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);


        return enrollments.stream()
                .map(Enrollment::getCourseId)
                .filter(courseId -> courseId != null)
                .distinct()
                .map(courseId -> courseRepository.findById(courseId)
                        .orElse(null))
                .filter(course -> course != null)
                .collect(Collectors.toList());
    }
    public List<ExamApplication> getExamApplicationsByUser(Long userId) {
        if (userId == null) {
            logger.warn("Attempted to fetch exam applications for null user ID");
            return List.of();
        }

        List<ExamApplication> applications = examApplicationRepository.findByUserId(userId);
        logger.debug("Found {} exam applications for user ID: {}", applications.size(), userId);
        return applications;
    }
    
    public List<ExamGrade> getExamGradesByUser(Long userId) {
        if (userId == null) {
            logger.warn("Attempted to fetch exam grades for null user ID");
            return List.of();
        }

        List<ExamGrade> grades = examGradeRepository.findByExamApplicationUserId(userId);

        logger.debug("Found {} exam grades for user ID: {}", grades.size(), userId);
        return grades;
    }
}
