package com.example.notification_service.service;

import com.example.notification_service.order.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final JavaMailSender javaMailSender;


    @KafkaListener(topics="order-placed", groupId = "notificationId2")
    public void listen(OrderPlacedEvent orderPlacedEvent) {
        log.info("Received order placed event {}", orderPlacedEvent);
        //Send the email
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);
            mimeMessageHelper.setFrom("springshop@email.com");
            mimeMessageHelper.setTo(orderPlacedEvent.getEmail().toString());
            mimeMessageHelper.setSubject(String.format("Order Placed %s", orderPlacedEvent.getOrderNumber()));
            mimeMessageHelper.setText(String.format("""
                    Hi
                    
                    Your order with the order number: %s has been placed successfully.
                    
                    Thank you for choosing us
                    UnipiSpringShop
                    """,
                    orderPlacedEvent.getOrderNumber()));
        };
        try{
            javaMailSender.send(messagePreparator);
            log.info("Mail sent successfully");
        }catch (MailException e){
            log.error("Exception occurred while sending email",e);
            throw new RuntimeException("Exception occurred while sending email to springshop@email.com", e);
        }
    }
}
