package com.demo1.order_service.repository;

import com.demo1.order_service.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByDateCreatedDesc(String email);
}