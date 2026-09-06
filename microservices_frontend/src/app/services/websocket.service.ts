import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client: Client;

  constructor() {
    // Φτιάχνουμε τον STOMP client που θα συνδεθεί στο Order Service
    this.client = new Client({
      brokerURL: 'ws://localhost:8081/ws', // 👈 Προσοχή: Εδώ βάζουμε το port του order-service, όχι του Gateway
      reconnectDelay: 5000,
      debug: (str) => {
        // Προαιρετικό: Τυπώνει στο console πότε συνδέεται για να βλέπεις ότι δουλεύει
        console.log(str);
      }
    });

    // Ξεκινάει τη σύνδεση με το backend
    this.client.activate();
  }

  // Μέθοδος για να ακούει ο Admin
  listenForAdminAlerts(callback: (message: string) => void) {
    this.client.onConnect = () => {
      this.client.subscribe('/topic/admin-alerts', (msg) => {
        callback(msg.body);
      });
    };
  }

  // Μέθοδος για να ακούει ο απλός χρήστης
  listenForUserAlerts(email: string, callback: (message: string) => void) {
    this.client.onConnect = () => {
      this.client.subscribe(`/topic/user-alerts/${email}`, (msg) => {
        callback(msg.body);
      });
    };
  }
}
