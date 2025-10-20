package com.university.lms.controller;

import com.university.lms.util.XmlImporter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @PostMapping("/xml")
    public ResponseEntity<String> uploadXml(@RequestParam MultipartFile file) {
        try {
            String xmlContent = new String(file.getBytes());
            return ResponseEntity.ok("XML uploaded and validated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing XML: " + e.getMessage());
        }
    }
}