package com.university.lms.controller;

import com.university.lms.entity.Course;
import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.ExamGrade;
import com.university.lms.entity.User;
import com.university.lms.repository.CourseRepository;
import com.university.lms.repository.ExamApplicationRepository;
import com.university.lms.repository.ExamGradeRepository;
import com.university.lms.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
public class ExamGradeController {

    private static final Logger logger = LoggerFactory.getLogger(ExamGradeController.class);

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ExamApplicationRepository examApplicationRepository;
    private final ExamGradeRepository examGradeRepository;

    public ExamGradeController(
            UserRepository userRepository,
            CourseRepository courseRepository,
            ExamApplicationRepository examApplicationRepository,
            ExamGradeRepository examGradeRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.examApplicationRepository = examApplicationRepository;
        this.examGradeRepository = examGradeRepository;
    }

    /**
     * Upload XML file containing exam applications and grades for a specific student.
     * 
     * Expected XML structure example:
     * <examData>
     *   <application term="Winter 2025" courseCode="CS101">
     *     <grade value="8.5" attempts="1"/>
     *     <grade value="7.0" attempts="2"/>
     *   </application>
     *   <application term="Summer 2025" courseCode="MATH202">
     *     <grade value="9.0" attempts="1"/>
     *   </application>
     * </examData>
     */
    @PostMapping("/exam-grades/upload-xml")
    @Transactional
    public ResponseEntity<String> uploadExamGradesXml(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studentId") Long studentId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded");
        }

        if (!file.getOriginalFilename().toLowerCase().endsWith(".xml")) {
            return ResponseEntity.badRequest().body("Only .xml files are allowed");
        }

        try {
            String xmlContent = new String(file.getBytes(), StandardCharsets.UTF_8);
            logger.info("XML upload received for studentId {} - file size: {} bytes", studentId, xmlContent.length());

            // Parse XML
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xmlContent)));
            doc.getDocumentElement().normalize();

            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

            List<String> messages = new ArrayList<>();
            int newApplications = 0;
            int newGrades = 0;

            // Process each <application>
            NodeList appNodes = doc.getElementsByTagName("application");
            for (int i = 0; i < appNodes.getLength(); i++) {
                Element appElem = (Element) appNodes.item(i);

                String term = appElem.getAttribute("term").trim();
                String courseCode = appElem.getAttribute("courseCode").trim();

                if (term.isEmpty() || courseCode.isEmpty()) {
                    messages.add("Skipping application #" + (i + 1) + ": missing term or courseCode");
                    continue;
                }

                Optional<Course> courseOpt = courseRepository.findByCode(courseCode);
                if (courseOpt.isEmpty()) {
                    messages.add("Skipping application #" + (i + 1) + ": course not found - " + courseCode);
                    continue;
                }
                Course course = courseOpt.get();

                // Check for duplicate application
                Optional<ExamApplication> existing = examApplicationRepository
                        .findByUserAndCourseAndTerm(student, course, term);

                ExamApplication application;
                if (existing.isPresent()) {
                    application = existing.get();
                    messages.add("Application already exists for " + courseCode + " (" + term + ")");
                } else {
                    application = new ExamApplication(student, course, term);
                    examApplicationRepository.save(application);
                    newApplications++;
                }

                // Process nested <grade> elements
                NodeList gradeNodes = appElem.getElementsByTagName("grade");
                for (int j = 0; j < gradeNodes.getLength(); j++) {
                    Element gradeElem = (Element) gradeNodes.item(j);

                    String gradeStr = gradeElem.getAttribute("value").trim();
                    String attemptsStr = gradeElem.getAttribute("attempts").trim();

                    if (gradeStr.isEmpty() || attemptsStr.isEmpty()) {
                        messages.add("Skipping grade #" + (j + 1) + " for " + courseCode + ": missing value or attempts");
                        continue;
                    }

                    float gradeValue;
                    int attemptsCount;
                    try {
                        gradeValue = Float.parseFloat(gradeStr);
                        attemptsCount = Integer.parseInt(attemptsStr);
                    } catch (NumberFormatException ex) {
                        messages.add("Invalid number format in grade for " + courseCode);
                        continue;
                    }

                    // Optional: validate grade range (e.g. 5.0–10.0)
                    if (gradeValue < 5.0f || gradeValue > 10.0f) {
                        messages.add("Invalid grade value " + gradeValue + " for " + courseCode);
                        continue;
                    }

                    // Check if this grade already exists for the application
                    boolean gradeExists = examGradeRepository.findByExamApplication(application)
                            .stream()
                            .anyMatch(g -> g.getGrade() == gradeValue && g.getNumberOfTakenExams() == attemptsCount);

                    if (!gradeExists) {
                        ExamGrade grade = new ExamGrade(application, gradeValue, attemptsCount);
                        examGradeRepository.save(grade);
                        newGrades++;
                    } else {
                        messages.add("Grade " + gradeValue + " (attempts: " + attemptsCount + ") already exists for application " + application.getId());
                    }
                }
            }

            String resultMessage = String.format(
                    "Processed successfully:\n" +
                    "- New applications created: %d\n" +
                    "- New grades created: %d\n" +
                    "\nWarnings / skipped items:\n%s",
                    newApplications,
                    newGrades,
                    messages.isEmpty() ? "None" : String.join("\n", messages)
            );

            return ResponseEntity.ok(resultMessage);

        } catch (Exception e) {
            logger.error("Failed to process XML upload for studentId {}: {}", studentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing XML file: " + e.getMessage());
        }
    }
}