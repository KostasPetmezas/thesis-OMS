import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Product} from "../../model/product";

@Injectable({
  providedIn: 'root'
})
/*
export class ProductService {

  constructor(private httpClient: HttpClient) {
  }

  getProducts(): Observable<Array<Product>> {
    return this.httpClient.get<Array<Product>>('http://localhost:9000/api/product');
  }

  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>('http://localhost:9000/api/product', product);
  }

 */
export class ProductService {
  private readonly http = inject(HttpClient);

  // Notice we now accept parameters and return 'any' to handle the Spring Page object
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
}
