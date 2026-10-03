package com.demo1.inventory_service.service;

import com.demo1.inventory_service.model.Inventory;
import com.demo1.inventory_service.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    // 1: Read only. Gets called when user presses "Order"
    public boolean isInStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException(("Product with SkuCode " + skuCode + " not found")));

        // Returns true if there is enough stock, else false
        return inventory.getQuantity() >= quantity;
    }

    // 2: Writes on the database. Gets called only if order gets Approved
    @Transactional
    public boolean reduceStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Product with SkuCode " + skuCode + " not found"));

        if (inventory.getQuantity() >= quantity) {
            inventory.setQuantity(inventory.getQuantity() - quantity);
            inventoryRepository.save(inventory);
            return true;
        }
        return false; // False if items gets extinct
    }

    // Creates the stock entry for a new product, or updates it if the SKU already exists.
    @Transactional
    public void addStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseGet(Inventory::new);
        inventory.setSkuCode(skuCode);
        inventory.setQuantity(quantity);
        inventoryRepository.save(inventory);
    }

    public Map<String, Integer> getStocks(List<String> skuCodes) {
        return inventoryRepository.findBySkuCodeIn(skuCodes).stream()
                .collect(Collectors.toMap(Inventory::getSkuCode, Inventory::getQuantity));
    }
}

