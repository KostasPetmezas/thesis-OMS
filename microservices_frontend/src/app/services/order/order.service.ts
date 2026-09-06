import { Injectable } from '@angular/core';
import {Product} from "../../model/product";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Order} from "../../model/order";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // 👇 THIS is the magic line that creates "this.http"
  constructor(private http: HttpClient) {
  }
  getAllOrdersForAdmin(): Observable<Order[]> {
    return this.http.get<Order[]>('http://localhost:9000/api/order/all');
  }

  getOrderHistory() {
    const authDataString = sessionStorage.getItem('0-angular-client');
    let token = null;
    if (authDataString) {
      token = JSON.parse(authDataString).authzData;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // We expect a JSON array of orders back, so no need for responseType: 'text' here!
    return this.http.get<any[]>('http://localhost:9000/api/order/history', { headers: headers });
  }

  orderProduct(orderRequest: any) {
    // 1. Grab the JSON string from Session Storage
    const authDataString = sessionStorage.getItem('0-angular-client');
    let token = null;

    // 2. Parse the JSON and extract the 'authzData' field (the real token!)
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      token = authData.authzData;
    }

    console.log(" REAL TOKEN EXTRACTED: ", token);

    // 3. Attach it to the Authorization header
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 4. Send the request
    return this.http.post('http://localhost:9000/api/order', orderRequest, {
      headers: headers,
      responseType: 'text'
    });
  }
  updateOrderStatus(orderId: number, status: string) {
    const authDataString = sessionStorage.getItem('0-angular-client');
    let token = null;

    if (authDataString) {
      token = JSON.parse(authDataString).authzData;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.patch(`http://localhost:9000/api/order/${orderId}/status?status=${status}`, {}, {
      headers: headers
    });
  }
}
