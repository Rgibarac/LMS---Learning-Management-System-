package com.university.lms.service;

import com.university.lms.entity.ExamApplication;
import com.university.lms.entity.ExamGrade;
import com.university.lms.repository.ExamApplicationRepository;
import com.university.lms.repository.ExamGradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamGradeService {
    @Autowired
    private ExamGradeRepository examGradeRepository;
    @Autowired
    private ExamApplicationRepository examApplicationRepository;

    public ExamGrade createExamGrade(Long examApplicationId, float grade, int numberOfTakenExams) {
        ExamApplication examApplication = examApplicationRepository.findById(examApplicationId)
            .orElseThrow(() -> new IllegalArgumentException("Exam application not found: " + examApplicationId));
        if (grade < 0 || grade > 10) {
            throw new IllegalArgumentException("Grade must be between 0 and 10");
        }
        if (numberOfTakenExams < 1) {
            throw new IllegalArgumentException("Number of taken exams must be at least 1");
        }
        ExamGrade examGrade = new ExamGrade(examApplication, grade, numberOfTakenExams);
        return examGradeRepository.save(examGrade);
    }

    public List<ExamGrade> getExamGradesByExamApplicationId(Long examApplicationId) {
        ExamApplication examApplication = examApplicationRepository.findById(examApplicationId)
            .orElseThrow(() -> new IllegalArgumentException("Exam application not found: " + examApplicationId));
        return examGradeRepository.findByExamApplication(examApplication);
    }

    public List<ExamGrade> getAllExamGrades() {
        return examGradeRepository.findAll();
    }

    public void deleteExamGrade(Long id) {
        if (!examGradeRepository.existsById(id)) {
            throw new IllegalArgumentException("Exam grade not found: " + id);
        }
        examGradeRepository.deleteById(id);
    }
}