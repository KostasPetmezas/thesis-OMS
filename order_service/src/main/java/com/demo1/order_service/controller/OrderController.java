package com.demo1.order_service.controller;

import com.demo1.order_service.dto.OrderRequest;
import com.demo1.order_service.dto.UserDetails;
import com.demo1.order_service.model.Order;
import com.demo1.order_service.repository.OrderRepository;
import com.demo1.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String createOrder(@RequestBody OrderRequest orderRequest, @AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }
        if (email == null || email.isBlank()) {
            email = "fallback@example.com";
        }

        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        // Create the verified UserDetails object
        UserDetails secureUserDetails = new UserDetails(email, firstName, lastName);


        OrderRequest secureOrderRequest = new OrderRequest(
                orderRequest.id(),
                orderRequest.orderNumber(),
                orderRequest.skuCode(),
                orderRequest.price(),
                orderRequest.quantity(),
                secureUserDetails
        );

        orderService.placeOrder(secureOrderRequest);
        return "Order created";
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@AuthenticationPrincipal Jwt jwt) {
        // 1. Ελέγχουμε ποιος κάνει το request
        String username = jwt.getClaimAsString("preferred_username");
        if (!"admin".equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only admins can view all orders");
        }

        // 2. Αν είναι admin, προχωράμε κανονικά
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> allOrders = orderService.getAllOrders();
        return ResponseEntity.ok(allOrders);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status, @AuthenticationPrincipal Jwt jwt) {
        // 1. Ελέγχουμε ποιος κάνει το request
        String username = jwt.getClaimAsString("preferred_username");
        if (!"admin".equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only admins can change order status");
        }

        // 2. Αν είναι admin, προχωράμε κανονικά
        orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
    }



}
