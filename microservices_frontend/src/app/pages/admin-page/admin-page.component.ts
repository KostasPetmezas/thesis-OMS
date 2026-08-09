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
      // Check if the user is logged in AND their Keycloak username is 'admin'
      const username = result.userData?.preferred_username;

      if (username === 'admin') {
        this.fetchAllOrders();
      } else {
        this.accessDenied = true;
        this.isLoading = false;
        // Optional: Kick them out automatically after 2 seconds
        setTimeout(() => this.router.navigateByUrl('/'), 2000);
      }
    });
  }

  fetchAllOrders() {
    this.orderService.getAllOrdersForAdmin().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch orders for admin', err);
        this.isLoading = false;
      }
    });
  }
}
