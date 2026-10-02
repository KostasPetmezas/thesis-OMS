package com.demo1.product_service.service;

import com.demo1.product_service.dto.ProductResponse;
import com.demo1.product_service.model.Product;
import com.demo1.product_service.dto.ProductRequest;
import com.demo1.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public ProductResponse createProduct(ProductRequest productRequest){
         // Reject duplicate SKU codes; the SKU links the product to its stock and orders.
        if (productRepository.findBySkuCode(productRequest.skuCode()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Product with SkuCode " + productRequest.skuCode() + " already exists");
        }




        Product product = Product.builder()
                .name(productRequest.name())
                .description(productRequest.description())
                .category(productRequest.category())
                .skuCode(productRequest.skuCode())
                .price(productRequest.price())
                .imageUrl(productRequest.imageURL())
                .build();
        productRepository.save(product);
        log.info("Success!! Product created successfully!");
        return new ProductResponse(product.getId(), product.getName(), product.getDescription(), product.getSkuCode(), product.getPrice(),  product.getImageUrl()) ;
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(product -> new ProductResponse(product.getId(), product.getName(), product.getDescription(), product.getSkuCode(), product.getPrice(), product.getImageUrl()))
                .toList();
    }
    public List<ProductResponse> getAllProductsByCategory(String category) {
        return productRepository.findByCategory(category)
                .stream()
                .map(product -> new ProductResponse(product.getId(), product.getName(), product.getDescription(), product.getSkuCode(), product.getPrice(),  product.getImageUrl()))
                .toList();
    }
}
