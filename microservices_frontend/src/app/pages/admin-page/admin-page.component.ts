import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order/order.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';
import { Order } from '../../model/order';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);

  allOrders: Array<Order> = [];
  isLoading = true;
  accessDenied = false;

  ngOnInit(): void {
    this.oidcSecurityService.userData$.subscribe(result => {
      const username = result.userData?.preferred_username;
      if (username === 'admin') {
        this.fetchAllOrders();
      } else {
        this.accessDenied = true;
        this.isLoading = false;
        setTimeout(() => this.router.navigateByUrl('/'), 2000);
      }
    });
  }

  fetchAllOrders() {
    this.orderService.getAllOrdersForAdmin().subscribe({
      next: (orders) => {
        // Sort orders so the newest ones (highest ID) appear first
        this.allOrders = orders.sort((a, b) => {
          // Fallback to 0 if id is undefined to prevent crash
          return (b.id || 0) - (a.id || 0);
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch orders for admin', err);
        this.isLoading = false;
      }
    });
  }

  updateStatus(order: Order, newStatus: string) {
    const oldStatus = order.status;

    // Optimistically update UI so the color changes instantly
    order.status = newStatus;

    if(order.id) {
      this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
        next: () => console.log(`Order ${order.id} status changed to ${newStatus}`),
        error: (err: any) => { // 👈 Added ": any" right here
          console.error('Failed to update status', err);
          // Revert UI color back if the backend HTTP call failed
          order.status = oldStatus;
        }
      });
    }
  }
}
