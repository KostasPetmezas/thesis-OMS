package com.demo1.inventory_service.controller;

import com.demo1.inventory_service.repository.InventoryRepository;
import com.demo1.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public boolean isInStock(@RequestParam String skuCode, @RequestParam Integer quantity) {
        return inventoryService.isInStock(skuCode, quantity);
    }

    // used to reduce item's stock
    @PutMapping("/reduce")
    @ResponseStatus(HttpStatus.OK)
    public boolean reduceStock(@RequestParam String skuCode, @RequestParam Integer quantity) {
        return inventoryService.reduceStock(skuCode, quantity);
    }

    // Adds stock for a newly created product.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void addStock(@RequestParam String skuCode, @RequestParam Integer quantity) {
        inventoryService.addStock(skuCode, quantity);
    }
}