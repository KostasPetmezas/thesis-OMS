package com.demo1.order_service.controller;

import com.demo1.order_service.model.Notification;
import com.demo1.order_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/order/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getMyNotifications(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");

        // Αν είναι ο admin, φέρνουμε καρφωτά τα "admin" notifications
        if ("admin".equals(username)) {
            return notificationRepository.findByRecipientEmailOrderByDateCreatedDesc("admin");
        }

        // Αλλιώς, φέρνουμε του απλού χρήστη βάσει του email του
        String email = jwt.getClaimAsString("email");
        return notificationRepository.findByRecipientEmailOrderByDateCreatedDesc(email);
    }
}