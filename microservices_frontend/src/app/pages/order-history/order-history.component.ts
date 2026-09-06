import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule // 👈 This automatically includes NgClass, SlicePipe, and DecimalPipe!
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
