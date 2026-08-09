package com.demo1.order_service.service;

import com.demo1.order_service.client.InventoryClient;
import com.demo1.order_service.dto.OrderRequest;
import com.demo1.order_service.event.OrderPlacedEvent;
import com.demo1.order_service.model.Order;
import com.demo1.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static com.demo1.order_service.client.InventoryClient.log;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final KafkaTemplate<Object, OrderPlacedEvent> kafkaTemplate;

    public void placeOrder(OrderRequest orderRequest){
        var isProductInStock=inventoryClient.isInStock(orderRequest.skuCode(), orderRequest.quantity());

        if(isProductInStock){

            //map OrderRequest to Order obj
            Order order = new Order();
            order.setOrderNumber(UUID.randomUUID().toString());
            order.setPrice(orderRequest.price());
            order.setSkuCode(orderRequest.skuCode());
            order.setQuantity(orderRequest.quantity());
            order.setUserDetails(orderRequest.userDetails());

            orderRepository.save(order);

            // Send to Kafka safely using the secure email
            OrderPlacedEvent orderPlacedEvent = new OrderPlacedEvent(order.getOrderNumber(), orderRequest.userDetails().email());
            log.info("Start - Sending OrderPlacedEvent {} to Kafka topic", orderPlacedEvent);
            kafkaTemplate.send("order-placed", orderPlacedEvent);
            log.info("End - Sending OrderPlacedEvent {} to Kafka topic", orderPlacedEvent);

        }else{
            throw new RuntimeException("Product with SkuCode "+orderRequest.skuCode()+" is not in stock");
        }

    }

    public List<Order> getOrderHistory(String email) {
        return orderRepository.findByUserEmail(email);
    }

    public List<Order> getAllOrders() {
        // findAll() is provided automatically by JpaRepository!
        return orderRepository.findAll();
    }
}
