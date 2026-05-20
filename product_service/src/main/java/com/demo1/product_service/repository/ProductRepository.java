package com.demo1.product_service.repository;

import com.demo1.product_service.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product,String> {
    List<Product> findByCategory(String category);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    // NEW METHOD: Fetches all products, but forces MongoDB to ignore case when sorting!
    @Query(value = "{}", collation = "{ 'locale' : 'en', 'strength' : 2 }")
    Page<Product> findAllWithCollation(Pageable pageable);

    Page<Product> findByCategory(String category, Pageable pageable);

    // 2. Filter by category AND search for a specific word
    Page<Product> findByNameContainingIgnoreCaseAndCategory(String name, String category, Pageable pageable);

    // Method for product page
    Optional<Product> findBySkuCode(String skuCode);
}
