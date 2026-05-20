import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // NEW
import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service'; // NEW

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-page.component.html',
  styleUrl: './product-page.component.css'
})
export class ProductPageComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  // We set product to 'any' for now, and it starts empty
  product: any;
  quantity = 1;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    // 1. Grab the ID or SKU from the URL (e.g., /product/123)
    // Make sure your routing file uses 'skuCode' like: { path: 'product/:skuCode', ... }
    const skuCode = this.route.snapshot.paramMap.get('skuCode');

    if (skuCode) {
      // 2. Fetch the data from the database
      this.productService.getProductBySku(skuCode).subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching product', err);
          this.errorMessage = 'Product not found.';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Invalid URL parameter.';
      this.isLoading = false;
    }
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    const cartItem = {
      skuCode: this.product.skuCode, // Ensure this matches your DB field exactly
      price: this.product.price,
      quantity: this.quantity
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        alert(`${this.product.name} was successfully added to your cart!`);
      },
      error: (err) => {
        console.error('Failed to add to cart', err);
        alert('Could not add item to cart. Please try again.');
      }
    });
  }
}
