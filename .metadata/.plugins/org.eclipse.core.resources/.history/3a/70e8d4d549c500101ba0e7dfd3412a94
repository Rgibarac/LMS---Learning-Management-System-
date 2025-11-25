package com.university.lms.service;

import com.university.lms.dto.UserDTO;
import com.university.lms.entity.Enrollment;
import com.university.lms.entity.User;
import com.university.lms.repository.CourseRepository;
import com.university.lms.repository.StudyProgramRepository;
import com.university.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private EnrollmentService enrollmentService;
    private CourseRepository courseRepository;    
    private StudyProgramRepository studyProgramRepository;
    private final PasswordEncoder passwordEncoder;
    
    
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

    public User updateUser(Long id, User user) {
        user.setId(id);
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
    
    
}