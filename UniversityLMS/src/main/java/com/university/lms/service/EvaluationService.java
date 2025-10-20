package com.university.lms.service;

import com.university.lms.entity.Course;
import com.university.lms.entity.Evaluation;
import com.university.lms.entity.User;
import com.university.lms.repository.EvaluationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EvaluationService {
    private final EvaluationRepository evaluationRepository;

    public EvaluationService(EvaluationRepository evaluationRepository) {
        this.evaluationRepository = evaluationRepository;
    }

    //public List<Evaluation> getEvaluationsByCourse(Course course) {
        //return evaluationRepository.findByCourse(course);
   // }

    public List<Evaluation> getEvaluationsByType(String type) {
        return evaluationRepository.findByType(type);
    }

//    public List<StudyHistoryDTO> getStudentEvaluations(Long userId, Long courseId) {
//        Course course = new Course();
//        course.setId(courseId);
//        List<Evaluation> evaluations = evaluationRepository.findByCourse(course);
//        return evaluations.stream()
//                .map(eval -> {
//                    Double grade = null;
//                    boolean passed = false;
//                    for (Map.Entry<User, Double> entry : eval.getStudentGrades().entrySet()) {
//                        if (entry.getKey().getId().equals(userId)) {
//                            grade = entry.getValue();
//                            if (grade != null && grade >= 6.0) {
//                                passed = true;
//                            }
//                            break;
//                        }
//                    }
//                    return new StudyHistoryDTO(
//                            courseId,
//                            course.getName() != null ? course.getName() : "Unknown Course",
//                            1,
//                            grade,
//                            passed ? (course.getEctsPoints() > 0 ? course.getEctsPoints() : 6) : 0,
//                            passed
//                    );
//                })
//                .filter(dto -> dto.getGrade() != null)
//                .collect(Collectors.toList());
//    }
}