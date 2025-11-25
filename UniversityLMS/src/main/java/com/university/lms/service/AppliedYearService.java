package com.university.lms.service;

import com.university.lms.entity.AppliedYear;
import com.university.lms.repository.AppliedYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AppliedYearService {

    private final AppliedYearRepository repository;

    public AppliedYear save(AppliedYear appliedYear) {
        if (repository.existsByUserIdAndYear(appliedYear.getUserId(), appliedYear.getYear())) {
            throw new IllegalArgumentException("User already has an entry for year " + appliedYear.getYear());
        }
        return repository.save(appliedYear);
    }

    public AppliedYear update(Long id, AppliedYear updated) {
        AppliedYear existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("AppliedYear not found"));

        existing.setYear(updated.getYear());
        existing.setRequiredEcts(updated.getRequiredEcts());
        existing.setStudyProgramId(updated.getStudyProgramId());
        existing.setUserId(updated.getUserId());
        return repository.save(existing);
    }

    public List<AppliedYear> getByUser(Long userId) {
        return repository.findByUserIdOrderByYearAsc(userId);
    }

    public AppliedYear getCurrentYear(Long userId) {
        return repository.findTopByUserIdOrderByYearDesc(userId).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}