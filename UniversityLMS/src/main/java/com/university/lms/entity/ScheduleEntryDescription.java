// src/main/java/com/university/lms/entity/ScheduleEntryDescription.java

package com.university.lms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "schedule_entry_descriptions")
public class ScheduleEntryDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "schedule_entry_id", nullable = false)
    private Long scheduleEntryId;

    // Constructors
    public ScheduleEntryDescription() {}

    public ScheduleEntryDescription(String name, String description, Long scheduleEntryId) {
        this.name = name;
        this.description = description;
        this.scheduleEntryId = scheduleEntryId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getScheduleEntryId() { return scheduleEntryId; }
    public void setScheduleEntryId(Long scheduleEntryId) { this.scheduleEntryId = scheduleEntryId; }
}