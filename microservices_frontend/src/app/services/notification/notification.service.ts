import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Notification {
  id?: number;
  recipientEmail: string;
  message: string;
  isRead: boolean;
  dateCreated: string; // Ταιριάζει με το πεδίο της Java
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  // Ξεκινάει με άδεια λίστα
  private notificationsSource = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSource.asObservable();

  // Ζητάει τα πραγματικά δεδομένα από το Backend
  fetchNotifications(token: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<Notification[]>('http://localhost:9000/api/order/notifications', { headers })
      .subscribe({
        next: (data) => this.notificationsSource.next(data),
        error: (err) => console.error('Failed to load notifications', err)
      });
  }

  getUnreadCount(): number {
    return this.notificationsSource.value.filter(n => !n.isRead).length;
  }

  addNotification(notification: Notification) {
    const current = this.notificationsSource.value;
    this.notificationsSource.next([notification, ...current]);
  }

  markAllAsRead() {
    const updated = this.notificationsSource.value.map(n => ({ ...n, isRead: true }));
    this.notificationsSource.next(updated);
  }
}
