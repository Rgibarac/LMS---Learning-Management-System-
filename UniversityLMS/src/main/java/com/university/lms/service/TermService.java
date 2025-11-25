package com.university.lms.service;

import com.university.lms.entity.Term;
import com.university.lms.repository.TermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TermService {

    private final TermRepository termRepository;

    public List<Term> getAllTerms() {
        return termRepository.findAll();
    }

    public Term getTermById(Long id) {
        return termRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Term not found: " + id));
    }

    public Term getCurrentTerm() {
        return termRepository.findCurrentTerm()
                .orElse(null);
    }

    public Term getActiveTerm() {
        return termRepository.findByActiveTrue().orElse(null);
    }

    public Term createTerm(Term term) {
        return termRepository.save(term);
    }

    public Term updateTerm(Long id, Term termDetails) {
        Term term = getTermById(id);
        term.setName(termDetails.getName());
        term.setStartDate(termDetails.getStartDate());
        term.setEndDate(termDetails.getEndDate());
        term.setEnrollmentStart(termDetails.getEnrollmentStart());
        term.setEnrollmentEnd(termDetails.getEnrollmentEnd());
        term.setDescription(termDetails.getDescription());
        term.setActive(termDetails.isActive());

        if (termDetails.isActive()) {
            termRepository.findAll().stream()
                    .filter(t -> !t.getId().equals(id))
                    .forEach(t -> t.setActive(false));
        }

        return termRepository.save(term);
    }

    public void deleteTerm(Long id) {
        Term term = getTermById(id);
        if (term.isActive()) {
            throw new RuntimeException("Cannot delete active term");
        }
        termRepository.delete(term);
    }
}