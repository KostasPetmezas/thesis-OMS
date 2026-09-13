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

    // ΦΑΣΗ 1: Διαβάζει μόνο. Καλείται όταν ο πελάτης πατάει "Order".
    public boolean isInStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException(("Product with SkuCode " + skuCode + " not found")));

        // ΜΟΝΟ ΕΛΕΓΧΟΣ: Επιστρέφει true αν υπάρχει αρκετό απόθεμα, false αν όχι.
        return inventory.getQuantity() >= quantity;
    }

    // ΦΑΣΗ 2: Γράφει στη βάση. Καλείται ΟΤΑΝ και ΑΝ ο Admin πατήσει "APPROVED".
    @Transactional
    public boolean reduceStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Product with SkuCode " + skuCode + " not found"));

        if (inventory.getQuantity() >= quantity) {
            // ΕΔΩ ΓΙΝΕΤΑΙ Η ΑΦΑΙΡΕΣΗ!
            inventory.setQuantity(inventory.getQuantity() - quantity);
            inventoryRepository.save(inventory);
            return true;
        }
        return false; // Το προϊόν εξαντλήθηκε στο μεσοδιάστημα
    }
}