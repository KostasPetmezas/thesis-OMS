package com.example.cart_service.controller;

import com.example.cart_service.model.Cart;
import com.example.cart_service.model.CartItem;
import com.example.cart_service.repository.CartRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartRepository cartRepository;

    public CartController(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @PostMapping
    public Cart addToCart(@RequestBody CartItem newItem, @AuthenticationPrincipal Jwt jwt) {
        // 1. Get the username from Keycloak token
        String userId = jwt.getClaimAsString("preferred_username");

        // 2. Find their existing cart, or create a new one
        Cart cart = cartRepository.findById(userId).orElse(new Cart(userId, new ArrayList<>()));

        // Check if the product is already in the cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getSkuCode().equals(newItem.getSkuCode()))
                .findFirst();

        // 3. Add the item and save back to Redis
        if (existingItem.isPresent()) {
            // 3a. If it exists, JUST ADD THE QUANTITIES TOGETHER!
            int newQuantity = existingItem.get().getQuantity() + newItem.getQuantity();
            existingItem.get().setQuantity(newQuantity);
        } else {
            // 3b. If it's a brand new product, add it to the list
            cart.getItems().add(newItem);
        }
        return cartRepository.save(cart);
    }

    @GetMapping
    public Cart getCart(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("preferred_username");
        return cartRepository.findById(userId).orElse(new Cart(userId, new ArrayList<>()));
    }

    @DeleteMapping
    public void clearCart(@AuthenticationPrincipal Jwt jwt) {
        // Find the user ID from the Keycloak token
        String userId = jwt.getClaimAsString("preferred_username");

        // Nuke their cart from Redis
        cartRepository.deleteById(userId);
    }
}
