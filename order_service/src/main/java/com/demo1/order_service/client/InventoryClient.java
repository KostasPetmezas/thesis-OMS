package com.demo1.order_service.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;


public interface InventoryClient {
    Logger log = LoggerFactory.getLogger(InventoryClient.class);

    //@CircuitBreaker(name="inventory", fallbackMethod = "fallbackMethod")
    //@Retry(name="inventory")
    @GetExchange("/api/inventory")
    boolean isInStock(@RequestParam("skuCode") String skuCode, @RequestParam("quantity") Integer quantity);

    /*
    default boolean fallbackMethod(String code, Integer quantity, Throwable throwable) {
        log.info("Cannot get inventory fot skucode {}, failure reason: {}", code, throwable.getMessage());
        return false;
    }

     */
}
