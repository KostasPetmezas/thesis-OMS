package com.demo1.order_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_notifications")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String recipientEmail; // "admin" ή το email του χρήστη
    private String message;
    private boolean isRead = false;
    private LocalDateTime dateCreated = LocalDateTime.now();
    private String type; // "NEW_ORDER" ή "STATUS_UPDATE"
}