import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Notification {
  id?: number;
  recipientEmail: string;
  message: string;
  read: boolean; // ΑΛΛΑΞΕ ΣΕ 'read'
  dateCreated: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  private notificationsSource = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSource.asObservable();

  fetchNotifications(token: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<Notification[]>('http://localhost:9000/api/order/notifications', { headers })
      .subscribe({
        next: (data) => this.notificationsSource.next(data),
        error: (err) => console.error('Failed to load notifications', err)
      });
  }

  getUnreadCount(): number {
    // ΑΛΛΑΞΕ ΣΕ 'n.read'
    return this.notificationsSource.value.filter(n => !n.read).length;
  }

  addNotification(notification: Notification) {
    const current = this.notificationsSource.value;
    this.notificationsSource.next([notification, ...current]);
  }

  markAllAsRead(token: string) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.put('http://localhost:9000/api/order/notifications/mark-read', {}, { headers })
      .subscribe({
        next: () => {
          // ΑΛΛΑΞΕ ΣΕ 'read: true'
          const updated = this.notificationsSource.value.map(n => ({ ...n, read: true }));
          this.notificationsSource.next(updated);
        },
        error: (err) => console.error('Failed to mark as read in DB', err)
      });
  }
}
