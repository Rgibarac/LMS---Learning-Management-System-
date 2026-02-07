package com.university.lms.controller;

import com.university.lms.entity.Course;
import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.ExamGrade;
import com.university.lms.entity.User;
import com.university.lms.service.UserService;
import com.university.lms.util.PdfExporter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import com.lowagie.text.Element;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

@RestController
@RequestMapping("/api")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        logger.info("Received registration request for user: {}", user.getUsername());
        try {
            User registeredUser = userService.register(user);
            logger.info("User registered successfully: {}", user.getUsername());
            return ResponseEntity.ok(registeredUser);
        } catch (IllegalArgumentException e) {
            logger.error("Registration failed for user: {}, error: {}", user.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during registration: {}", e.getMessage());
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }
    
    

    

    @PutMapping("/users/update")
    public ResponseEntity<?> updateUser(@RequestBody User userUpdates, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String currentUsername = authentication.getName();
        User currentUser = userService.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Current user not found"));

        boolean isAdmin = "ADMIN".equals(currentUser.getRole()) || "STAFF".equals(currentUser.getRole());


        if (!isAdmin && !currentUsername.equals(userUpdates.getUsername())) {
            return ResponseEntity.status(403).body("You can only update your own profile");
        }


        String targetUsername = isAdmin ? userUpdates.getUsername() : currentUsername;

        try {
            User targetUser = userService.findByUsername(targetUsername)
                    .orElseThrow(() -> new UsernameNotFoundException("Target user not found"));


            targetUser.setEmail(userUpdates.getEmail());
            targetUser.setFirstName(userUpdates.getFirstName());
            targetUser.setLastName(userUpdates.getLastName());
            targetUser.setIndexNumber(userUpdates.getIndexNumber());


            if (isAdmin && userUpdates.getRole() != null) {
                targetUser.setRole(userUpdates.getRole());
            }

            User saved = userService.updateUser(targetUser);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            logger.error("Update failed", e);
            return ResponseEntity.status(500).body("Update failed: " + e.getMessage());
        }
    }

    @GetMapping("/users/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        logger.info("Fetching profile for user: {}", authentication.getName());
        try {
            User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            logger.info("Profile retrieved successfully for user: {}", user.getUsername());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            logger.error("Profile fetch failed: {}", e.getMessage());
            return ResponseEntity.status(404).body("Profile not found: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during profile fetch: {}", e.getMessage());
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/admin/export/users")
    public ResponseEntity<byte[]> exportUsers(@RequestParam("format") String format) {
        logger.info("Exporting users in format: {}", format);
        try {
            if (!"pdf".equalsIgnoreCase(format)) {
                logger.error("Unsupported format: {}", format);
                return ResponseEntity.badRequest().body("Unsupported format".getBytes());
            }

            List<User> users = userService.getAllUsers();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            document.add(new Paragraph("Users Report"));
            document.add(new Paragraph(" "));
            for (User user : users) {
                document.add(new Paragraph("ID: " + user.getId()));
                document.add(new Paragraph("Username: " + user.getUsername()));
                document.add(new Paragraph("Email: " + user.getEmail()));
                document.add(new Paragraph("Role: " + user.getRole()));
                document.add(new Paragraph("First Name: " + user.getFirstName()));
                document.add(new Paragraph("Last Name: " + user.getLastName()));
                document.add(new Paragraph("Index Number: " + user.getIndexNumber()));
                document.add(new Paragraph(" "));
            }
            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "users.pdf");

            logger.info("Users exported as PDF successfully");
            return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
        } catch (Exception e) {
            logger.error("Error exporting users as PDF: {}", e.getMessage());
            return ResponseEntity.status(500).body(("Error exporting users: " + e.getMessage()).getBytes());
        }
    }
    
    @GetMapping("/public/getTeachers")
    public List<User> getAllTeachers() {
        return userService.getAllTeachers();
    }
    
    @GetMapping("/public/users/{id}/pdf")
    public ResponseEntity<ByteArrayResource> exportStudentPdf(@PathVariable Long id) {
        try {
            User student = userService.findById(id);

            List<String> enrolledYears = userService.getEnrolledYearsAsStringList(id);
            List<Course> enrolledCourses = userService.getEnrolledCourses(id);

            byte[] pdfBytes = PdfExporter.exportSingleStudentToPdf(student, enrolledYears, enrolledCourses);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition
                    .attachment()
                    .filename(student.getFirstName() + "_" + student.getLastName() + "_Profile.pdf")
                    .build());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new ByteArrayResource(pdfBytes));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }}
    
    @GetMapping("/public/users/{id}/grades/pdf")
    public ResponseEntity<ByteArrayResource> exportStudentGradesPdf(@PathVariable Long id) {
     try {
     User student = userService.findById(id);
     if (student == null) {
     logger.warn("Student not found for grades PDF: {}", id);
     return ResponseEntity.notFound().build();
     }

     List<ExamApplication> applications = userService.getExamApplicationsByUser(id);
     List<ExamGrade> grades = userService.getExamGradesByUser(id);

     logger.info("Fetched {} applications and {} grades for student {}", applications.size(), grades.size(), id);

     byte[] pdfBytes = PdfExporter.exportStudentExamGradesToPdf(student, applications, grades);
     if (pdfBytes.length == 0) {
     logger.warn("Empty PDF generated for student {}", id);
     return ResponseEntity.status(204).build(); // No content
     }

     HttpHeaders headers = new HttpHeaders();
     headers.setContentType(MediaType.APPLICATION_PDF);
     headers.setContentDisposition(ContentDisposition.attachment()
     .filename(student.getFirstName() + "_" + student.getLastName() + "_Grades.pdf")
     .build());

     return ResponseEntity.ok().headers(headers).body(new ByteArrayResource(pdfBytes));
     } catch (Exception e) {
     logger.error("Grades PDF generation failed for {}: {}", id, e.getMessage(), e);
     return ResponseEntity.status(500).contentType(MediaType.TEXT_PLAIN)
     .body(new ByteArrayResource(("Error: " + e.getMessage()).getBytes()));
     }
    }
    
    
}