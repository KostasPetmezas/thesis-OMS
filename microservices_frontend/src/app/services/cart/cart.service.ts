import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// You can move these interfaces to a separate file (e.g., model/cart.ts) if you prefer!
export interface CartItem {
  skuCode: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Centralizing the URL so we only have to type it once
  private readonly cartUrl = 'http://localhost:9000/api/cart';

  constructor(private httpClient: HttpClient) {}

  // 1. Fetch the user's current cart from Redis
  getCart(): Observable<Cart> {
    return this.httpClient.get<Cart>(this.cartUrl);
  }


  // 2. Add a single item to the cart
  addToCart(item: CartItem): Observable<Cart> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.httpClient.post<Cart>(this.cartUrl, item, httpOptions);
  }

  // 3. Delete the entire cart (used after a successful checkout)
  clearCart(): Observable<string> {
    // We use responseType 'text' here just like your OrderService,
    // because a DELETE request often returns an empty body or simple string
    const httpOptions = {
      responseType: 'text' as 'json'
    };
    return this.httpClient.delete<string>(this.cartUrl, httpOptions);
  }
}
