package com.demo1.order_service.controller;

import com.demo1.order_service.dto.OrderRequest;
import com.demo1.order_service.dto.UserDetails;
import com.demo1.order_service.model.Order;
import com.demo1.order_service.repository.OrderRepository;
import com.demo1.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
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

        // TRIPWIRE 1: Did we get the right email from Keycloak?
        String email = jwt.getClaimAsString("email");
        System.out.println(" KEYCLOAK EMAIL EXTRACTED: " + email);

        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }

        // 3. Fallback for the fallback (so Kafka never gets an empty string again!)
        if (email == null || email.isBlank()) {
            email = "fallback@example.com";
        }

        // TRIPWIRE 2: Did the frontend send the SKU?
        System.out.println(" SKU RECEIVED FROM ANGULAR: " + orderRequest.skuCode());

        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        // 2. Create a secure version of the UserDetails
        UserDetails secureUserDetails = new UserDetails(email, firstName, lastName);

        // 3. Overwrite whatever the frontend sent with the secure, verified data
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

    @GetMapping("/history")
    @ResponseStatus(HttpStatus.OK)
    public List<Order> getOrderHistory(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }
        return orderService.getOrderHistory(email);
    }



}
