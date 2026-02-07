package com.university.lms.util;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.university.lms.entity.Course;
import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.ExamGrade;
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
    
    public static byte[] exportSingleStudentToPdf(User student,
            List<String> enrolledYears,
            List<Course> enrolledCourses) throws DocumentException {

ByteArrayOutputStream baos = new ByteArrayOutputStream();
Document document = new Document(PageSize.A4, 50, 50, 50, 50);
PdfWriter.getInstance(document, baos);
document.open();

Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);


Paragraph title = new Paragraph("Student Academic Profile", titleFont);
title.setAlignment(Element.ALIGN_CENTER);
title.setSpacingAfter(30);
document.add(title);


document.add(new Paragraph("Personal Information", headerFont));
document.add(new Paragraph("Name: " + student.getFirstName() + " " + student.getLastName(), normalFont));
document.add(new Paragraph("Email: " + student.getEmail(), normalFont));
document.add(new Paragraph("Index Number: " + 
(student.getIndexNumber() != null ? student.getIndexNumber() : "Not assigned"), normalFont));
document.add(new Paragraph(" ")); // spacer


document.add(new Paragraph("Enrolled Academic Years", headerFont));
if (enrolledYears.isEmpty()) {
document.add(new Paragraph("No year enrollments recorded.", normalFont));
} else {
for (String year : enrolledYears) {
document.add(new Paragraph("• " + year, normalFont));
}
}
document.add(new Paragraph(" "));


document.add(new Paragraph("Currently Enrolled Courses", headerFont));
if (enrolledCourses.isEmpty()) {
document.add(new Paragraph("No courses enrolled yet.", normalFont));
} else {
for (Course course : enrolledCourses) {
document.add(new Paragraph("• " + course.getName() +
" (" + course.getCode() + ") – " + course.getEctsPoints() + " ECTS", normalFont));
}
}

document.close();
return baos.toByteArray();
}
    public static byte[] exportStudentExamGradesToPdf(
            User student,
            List<ExamApplication> applications,
            List<ExamGrade> grades) throws DocumentException {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 60, 50);
        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font smallFont  = FontFactory.getFont(FontFactory.HELVETICA, 10);

        // Header
        Paragraph title = new Paragraph(
            student.getFirstName() + " " + student.getLastName() + " – Exam Grades History",
            titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        Paragraph subtitle = new Paragraph(
            "Index: " + (student.getIndexNumber() != null ? student.getIndexNumber() : "—") +
            "    |    Email: " + student.getEmail(),
            smallFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(30);
        document.add(subtitle);

        if (applications.isEmpty()) {
            document.add(new Paragraph("No exam applications / grades recorded yet.", normalFont));
        } else {
            for (ExamApplication app : applications) {
                Course c = app.getCourse();

                document.add(new Paragraph(c.getName() + " (" + c.getCode() + ")", headerFont));
                document.add(new Paragraph("Term: " + app.getTerm(), normalFont));
                document.add(new Paragraph(" "));

                ExamGrade grade = grades.stream()
                    .filter(g -> g.getExamApplication().getId().equals(app.getId()))
                    .findFirst()
                    .orElse(null);

                if (grade != null) {
                    Paragraph p = new Paragraph();
                    p.add(new Chunk("Grade: ", normalFont));
                    p.add(new Chunk(String.format("%.1f", grade.getGrade()), normalFont));
                    p.add(new Chunk("    |    Attempts: ", normalFont));
                    p.add(new Chunk(String.valueOf(grade.getNumberOfTakenExams()), normalFont));
                    document.add(p);
                } else {
                    document.add(new Paragraph("Grade not yet assigned", normalFont));
                }

                document.add(new Paragraph("────────────────────────────────", smallFont));
                document.add(new Paragraph(" "));
            }
        }

        document.close();
        return baos.toByteArray();
    }
}