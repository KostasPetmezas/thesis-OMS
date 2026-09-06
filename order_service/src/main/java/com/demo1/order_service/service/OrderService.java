package com.demo1.order_service.service;

import com.demo1.order_service.client.InventoryClient;
import com.demo1.order_service.dto.OrderRequest;
import com.demo1.order_service.event.OrderPlacedEvent;
import com.demo1.order_service.model.Notification;
import com.demo1.order_service.model.Order;
import com.demo1.order_service.repository.NotificationRepository;
import com.demo1.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.demo1.order_service.client.InventoryClient.log;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final KafkaTemplate<Object, OrderPlacedEvent> kafkaTemplate;

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;


    public void placeOrder(OrderRequest orderRequest){
        var isProductInStock = inventoryClient.isInStock(orderRequest.skuCode(), orderRequest.quantity());

        if(isProductInStock){
            // map OrderRequest to Order obj
            Order order = new Order();
            order.setOrderNumber(UUID.randomUUID().toString());
            order.setPrice(orderRequest.price());
            order.setSkuCode(orderRequest.skuCode());
            order.setQuantity(orderRequest.quantity());
            order.setUserDetails(orderRequest.userDetails());

            // The status defaults to "PENDING" automatically from the Order entity!

            orderRepository.save(order);

            // Send to Kafka safely using the secure email
            OrderPlacedEvent orderPlacedEvent = new OrderPlacedEvent(order.getOrderNumber(), orderRequest.userDetails().email());
            log.info("Start - Sending OrderPlacedEvent {} to Kafka topic", orderPlacedEvent);
            kafkaTemplate.send("order-placed", orderPlacedEvent);
            log.info("End - Sending OrderPlacedEvent {} to Kafka topic", orderPlacedEvent);

            Notification adminAlert = new Notification(null, "admin", "Νέα παραγγελία: #" + order.getOrderNumber().substring(0,8), false, LocalDateTime.now(), "NEW_ORDER");
            notificationRepository.save(adminAlert);
            messagingTemplate.convertAndSend("/topic/admin-alerts", adminAlert);

        } else {
            throw new RuntimeException("Product with SkuCode " + orderRequest.skuCode() + " is not in stock");
        }
    }

    public List<Order> getOrderHistory(String email) {
        // Calls our new foolproof query
        return orderRepository.findByExactEmail(email);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 👇 ADDED: The logic for the Admin Panel to update order statuses
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        orderRepository.save(order);

        if (order.getUserDetails() != null) {
            String userEmail = order.getUserDetails().email();
            Notification userAlert = new Notification(null, userEmail, "Η παραγγελία #" + order.getOrderNumber().substring(0,8) + " είναι πλέον: " + status, false, LocalDateTime.now(), "STATUS_UPDATE");
            notificationRepository.save(userAlert);
            messagingTemplate.convertAndSend("/topic/user-alerts/" + userEmail, userAlert);
        }
    }
}