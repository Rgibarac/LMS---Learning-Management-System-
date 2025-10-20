package com.university.lms.controller;

public class ExamRegistrationRequest {
    private Long userId;
    private Long evaluationId;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getEvaluationId() { return evaluationId; }
    public void setEvaluationId(Long evaluationId) { this.evaluationId = evaluationId; }
}