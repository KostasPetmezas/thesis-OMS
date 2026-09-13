import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { NotificationService, Notification } from '../../services/notification/notification.service';
import { WebsocketService } from '../../services/websocket.service'; // 👈 1. Κάνε import το Websocket Service

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly websocketService = inject(WebsocketService); // 👈 2. Κάνε το inject

  isAuthenticated = false;
  username = '';
  isAdmin = false;
  isMenuOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    this.oidcSecurityService.checkAuth().subscribe();

    this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
      this.isAuthenticated = isAuthenticated;
    });

    this.oidcSecurityService.userData$.subscribe(({ userData }) => {
      if (userData) {
        this.username = userData.preferred_username || userData.email || 'User';
        this.isAdmin = this.username === 'admin';

        this.oidcSecurityService.getAccessToken().subscribe(token => {
          if (token) this.notificationService.fetchNotifications(token);
        });

        // 👈 3. LIVE WEB SOCKETS ΕΔΩ
        if (this.isAdmin) {
          // Ο Admin ακούει το γενικό κανάλι
          this.websocketService.listenForAdminAlerts((msg) => {
            const newAlert = JSON.parse(msg); // Το Spring Boot στέλνει JSON
            this.notificationService.addNotification(newAlert);
          });

          if (this.router.url === '/') this.router.navigate(['/admin']);

        } else if (userData.email) {
          // Ο απλός χρήστης ακούει το προσωπικό του κανάλι
          this.websocketService.listenForUserAlerts(userData.email, (msg) => {
            const newAlert = JSON.parse(msg);
            this.notificationService.addNotification(newAlert);
          });
        }
      } else {
        this.isAdmin = false;
      }
    });

    this.notificationService.notifications$.subscribe(data => {
      this.notifications = data;
      this.unreadCount = this.notificationService.getUnreadCount();
    });
  }

  login() { this.oidcSecurityService.authorize(); }
  logout() { this.oidcSecurityService.logoff().subscribe(); }
  toggleNotifications() { this.isMenuOpen = !this.isMenuOpen; }
  // Αντικατάστησε την markAsRead() με αυτή:
  markAsRead() {
    this.oidcSecurityService.getAccessToken().subscribe(token => {
      if (token) {
        this.notificationService.markAllAsRead(token);
      }
    });
  }
}
