package com.demo1.inventory_service.service;

import com.demo1.inventory_service.model.Inventory;
import com.demo1.inventory_service.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    @Transactional
    public boolean isInStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException(("Product with SkuCode " + skuCode + " not found")));

        if (inventory.getQuantity() >= quantity) {

            // 3. DEDUCT THE STOCK!
            inventory.setQuantity(inventory.getQuantity() - quantity);

            // 4. Save the new quantity back to MySQL
            inventoryRepository.save(inventory);

            return true;
        } else {
            return false; // Not enough stock
        }
    }
}
