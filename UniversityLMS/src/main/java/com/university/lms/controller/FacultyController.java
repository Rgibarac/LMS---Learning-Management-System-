package com.university.lms.controller;

import com.university.lms.entity.Faculty;
import com.university.lms.service.FacultyService;
import com.university.lms.util.XmlExporter;
import com.university.lms.util.XmlImporter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api")
public class FacultyController {
    @Autowired
    private FacultyService facultyService;

    @GetMapping("/public/faculties")
    public ResponseEntity<List<Faculty>> getAllFaculties() {
        return ResponseEntity.ok(facultyService.getAllFaculties());
    }

    @PostMapping("/admin/faculties")
    public ResponseEntity<Faculty> createFaculty(@RequestBody Faculty faculty) {
        return ResponseEntity.ok(facultyService.saveFaculty(faculty));
    }

    @GetMapping("/public/faculties/search")
    public ResponseEntity<List<Faculty>> searchFacultiesByDean(@RequestParam(required = false) String dean) {
        return ResponseEntity.ok(facultyService.findByDean(dean));
    }

    @GetMapping("/admin/faculties/export/xml")
    public ResponseEntity<String> exportFacultiesToXml() throws Exception {
        List<Faculty> faculties = facultyService.getAllFaculties();
        String xml = XmlExporter.exportToXml(faculties, Faculty.class);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=faculties.xml")
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }

    @PostMapping("/admin/faculties/import/xml")
    public ResponseEntity<Faculty> importFacultyFromXml(@RequestParam MultipartFile file) throws Exception {
        File tempFile = File.createTempFile("faculty-import", ".xml");
        file.transferTo(tempFile);
        Faculty faculty = XmlImporter.importFromXml(tempFile.getAbsolutePath(), Faculty.class, "src/main/resources/schemas/faculty.xsd");
        tempFile.delete();
        return ResponseEntity.ok(facultyService.importFaculty(faculty));
    }
}