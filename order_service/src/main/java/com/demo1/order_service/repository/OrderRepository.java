package com.demo1.order_service.repository;

import com.demo1.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // nativeQuery = true forces it to use raw MySQL, bypassing the IDE's Java inspection
    @Query(value = "SELECT * FROM t_orders WHERE email = :email ORDER BY id DESC", nativeQuery = true)
    List<Order> findByExactEmail(@Param("email") String email);
}