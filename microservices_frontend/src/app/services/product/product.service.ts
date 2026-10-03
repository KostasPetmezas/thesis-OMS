import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Product} from "../../model/product";

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private readonly http = inject(HttpClient);

  getProducts(page: number = 0, size: number = 10, search: string = '', category: string = '', sortBy: string = 'name', sortDir: string = 'asc'): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search)
      .set('category', category)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<any>('http://localhost:9000/api/product', { params });
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>('http://localhost:9000/api/product', product);
  }

  getProductBySku(skuCode: string): Observable<any> {
    return this.http.get<any>(`http://localhost:9000/api/product/${skuCode}`);
  }

  addStock(skuCode: string, quantity: number): Observable<void> {
    const params = new HttpParams().set('skuCode', skuCode).set('quantity', quantity);
    return this.http.post<void>('http://localhost:9000/api/inventory', null, { params });
  }

  getStocks(skuCodes: string[]): Observable<{ [key: string]: number }> {
    const params = new HttpParams().set('skuCodes', skuCodes.join(','));
    return this.http.get<{ [key: string]: number }>('http://localhost:9000/api/inventory/stocks', { params });
  }
}
