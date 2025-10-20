package com.university.lms.repository;

import com.university.lms.entity.CustomContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomContentRepository extends JpaRepository<CustomContent, Long> {
}