import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgIf } from "@angular/common";
import { CartService } from "../../services/cart/cart.service";
import { OrderService } from "../../services/order/order.service";
import {CartItem} from "../../model/cart";
import {forkJoin} from "rxjs";
import {HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgIf, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  orderPlaced = false;

  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe((cart: any) => {
      // Ensure we default to an empty array if items are missing
      this.cartItems = cart.items || [];
    });
  }

  // Automatically calculates the total price of everything in the cart
  get totalCartPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  checkout(): void {
    if (this.cartItems.length === 0) return;

    // 1. Create an array of pending HTTP requests
    const orderObservables = this.cartItems.map(item => {
      const orderRequest = {
        skuCode: item.skuCode,
        price: item.price,
        quantity: item.quantity,
        userDetails: {
          email: "",
          firstName: "",
          lastName: "",
        }
      };

      // Return the observable, but DO NOT subscribe yet
      return this.orderService.orderProduct(orderRequest);
    });

    // 2. Fire them all at once and wait for them to finish!
    forkJoin(orderObservables).subscribe({
      next: (results) => {
        console.log('All orders placed successfully!', results);
        this.clearCart(true); // Clear cart safely only after all succeed
      },
      error: (err) => {
        console.error('Failed to process checkout!', err);
        alert('Failed to place one or more items. Check console for details.');
      }
    });
  }

  clearCart(isCheckout: boolean = false): void {
    this.cartService.clearCart().subscribe(() => {
      this.cartItems = [];
      if (isCheckout) {
        this.orderPlaced = true;
      }
    });
  }
}
