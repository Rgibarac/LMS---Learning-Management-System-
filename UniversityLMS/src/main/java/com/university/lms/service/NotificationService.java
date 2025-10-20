package com.university.lms.service;

import com.university.lms.entity.Notification;
import com.university.lms.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Notification notification) {
        notification.setId(null);
        notification.setCreatedAt(java.time.LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByRole(String role) {
        return notificationRepository.findByRecipientRole(role);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }
}