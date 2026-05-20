import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // <-- To read the URL
import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service'; // <-- To fetch the DB

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

  product: any = undefined;
  quantity = 1;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    // 1. Grab the SKU from the URL (e.g., /product/airpods_pro_2)
    const skuCode = this.route.snapshot.paramMap.get('skuCode');

    if (skuCode) {
      // 2. Fetch the real data from your Spring Boot database!
      this.productService.getProductBySku(skuCode).subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching product from database:', err);
          this.errorMessage = 'Product not found.';
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Invalid URL.';
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

  addToCart(product: any, quantityStr: string) {
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    const cartItem = {
      skuCode: product.skuCode,
      price: product.price,
      quantity: quantity
    };
    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        alert(`${product.name} was successfully added to your cart!`);
      },
      error: (err) => {
        console.error('Failed to add to cart', err);
        alert('Could not add item to cart. Please try again.');
      }
    });
  }
}
