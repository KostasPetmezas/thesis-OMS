package com.example.cart_service.repository;

import com.example.cart_service.model.Cart;

import org.springframework.data.repository.CrudRepository;

public interface CartRepository extends CrudRepository<Cart, String> {
}
