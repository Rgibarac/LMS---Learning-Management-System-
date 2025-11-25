package com.university.lms.repository;

import com.university.lms.entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TermRepository extends JpaRepository<Term, Long> {

    Optional<Term> findByActiveTrue();

    @Query("SELECT t FROM Term t WHERE t.startDate <= CURRENT_DATE AND t.endDate >= CURRENT_DATE")
    Optional<Term> findCurrentTerm();
}