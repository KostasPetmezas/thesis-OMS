package com.demo1.product_service.Controller;

import com.demo1.product_service.dto.ProductRequest;
import com.demo1.product_service.dto.ProductResponse;
import com.demo1.product_service.model.Product;
import com.demo1.product_service.repository.ProductRepository;
import com.demo1.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.lang.Thread.sleep;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    private final ProductRepository productRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@RequestBody ProductRequest productRequest){
        return productService.createProduct(productRequest);
    }

    /*
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ProductResponse> getAllProducts(@RequestParam(required = false) String category) {
        // If the frontend sent a category
        if (category != null && !category.isBlank()) {
            return productService.getAllProductsByCategory(category);
        }
        // If the frontend didn't send a category
        return productService.getAllProducts();
    }

     */
    @GetMapping
    public Page<Product> getAllProducts(
            // 1. Pagination parameters (defaults to page 0, 10 items)
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            // 2. Search parameter
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "")  String category,
            // 3. Sorting parameters (defaults to sorting by name, ascending)
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        // Build the sorting rule
        // 1. Determine the direction
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;

        // 2. Build the Sort object
        Sort sort = Sort.by(direction, sortBy);

        // Build the pagination rule
        Pageable pageable = PageRequest.of(page, size, sort);

        boolean hasSearch = !search.isBlank();
        boolean hasCategory = !category.isBlank();

        // The Routing Logic
        if (!hasSearch && !hasCategory) {
            return productRepository.findAllWithCollation(pageable);
        } else if (hasSearch && !hasCategory) {
            return productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else if (!hasSearch && hasCategory) {
            return productRepository.findByCategory(category, pageable);
        } else {
            // User is searching AND has a category selected
            return productRepository.findByNameContainingIgnoreCaseAndCategory(search, category, pageable);
        }
    }
}
