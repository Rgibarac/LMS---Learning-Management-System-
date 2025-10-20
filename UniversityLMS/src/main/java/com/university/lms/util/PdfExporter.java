package com.university.lms.util;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.university.lms.entity.Course;
import com.university.lms.entity.Syllabus;
import com.university.lms.entity.User;
import java.io.ByteArrayOutputStream;
import java.util.List;

public class PdfExporter {

    public static byte[] exportUsersToPdf(List<User> users) throws DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, baos);
        document.open();

        for (User user : users) {
            document.add(new Paragraph("Username: " + user.getUsername()));
            document.add(new Paragraph("Role: " + user.getRole()));
            document.add(new Paragraph("Email: " + user.getEmail()));
            document.add(new Paragraph("------------------------"));
        }

        document.close();
        return baos.toByteArray();
    }

    public static byte[] exportCoursesToPdf(List<Course> courses) throws DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, baos);
        document.open();

        for (Course course : courses) {
            document.add(new Paragraph("Name: " + course.getName()));
            document.add(new Paragraph("Description: " + course.getDescription()));
            document.add(new Paragraph("------------------------"));
        }

        document.close();
        return baos.toByteArray();
    }

    public static byte[] exportSyllabusesToPdf(List<Syllabus> syllabuses) throws DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, baos);
        document.open();

        for (Syllabus syllabus : syllabuses) {
            document.add(new Paragraph("ID: " + syllabus.getId()));
            document.add(new Paragraph("Content: " + syllabus.getContent()));
            document.add(new Paragraph("------------------------"));
        }

        document.close();
        return baos.toByteArray();
    }
}