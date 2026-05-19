package com.demo1.order_service.repository;

import com.demo1.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Integer> {
    List<Order> findByUserEmail(String userEmail);
}
