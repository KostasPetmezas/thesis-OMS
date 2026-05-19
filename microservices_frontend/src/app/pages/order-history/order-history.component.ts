import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../services/order/order.service'; // Adjust path if needed!
import { SlicePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    SlicePipe,
    DecimalPipe
  ],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  orders: any[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.fetchOrderHistory();
  }

  fetchOrderHistory() {
    this.orderService.getOrderHistory().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.errorMessage = 'Failed to load order history. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
