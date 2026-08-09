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

        // Overwrite using the exact fields from your OrderRequest record definition
        OrderRequest secureOrderRequest = new OrderRequest(
                orderRequest.id(),
                orderRequest.orderNumber(),
                orderRequest.skuCode(),
                orderRequest.price(),
                orderRequest.quantity(),
                secureUserDetails // Matches the 6th field (details) in your record
        );

        orderService.placeOrder(secureOrderRequest);
        return "Order created";
    }

    @GetMapping("/history")
    @ResponseStatus(HttpStatus.OK)
    public List<Order> getOrderHistory(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }
        return orderService.getOrderHistory(email);
    }
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        // Assuming your OrderService has a findAll() or similar method
        List<Order> allOrders = orderService.getAllOrders();
        return ResponseEntity.ok(allOrders);
    }





}
