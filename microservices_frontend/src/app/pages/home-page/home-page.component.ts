import {Component, inject, OnInit} from '@angular/core';
import {OidcSecurityService} from "angular-auth-oidc-client";
import {Product} from "../../model/product";
import {ProductService} from "../../services/product/product.service";
import {AsyncPipe, JsonPipe} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {Order} from "../../model/order";
import {FormsModule} from "@angular/forms";
import {OrderService} from "../../services/order/order.service";
import {CartService} from "../../services/cart/cart.service";

@Component({
  selector: 'app-homepage',
  templateUrl: './home-page.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    FormsModule,
    RouterLink
  ],
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  isAuthenticated = false;
  products: Array<Product> = [];
  quantityIsNull = false;
  orderSuccess = false;
  orderFailed = false;

  // --- NEW STATE VARIABLES FOR SEARCH & PAGINATION ---
  currentPage = 0;
  pageSize = 10;
  searchQuery = '';
  sortBy = 'name';
  sortDir = 'asc';
  totalPages = 0;
  totalElements = 0;

  // Variables for categories
  selectedCategory = 'All';
  categories = ['All', 'Smartphones', 'Laptops', 'Audio', 'Wearables', 'Gaming'];

  ngOnInit(): void {
    this.oidcSecurityService.isAuthenticated$.subscribe(
      ({isAuthenticated}) => {
        this.isAuthenticated = isAuthenticated;
        // Replaced direct getProducts call with our new load method
        this.loadProducts();
      }
    )
  }

  // METHODS FOR SEARCH, PAGINATION AND FILTER
  loadProducts() {
    const categoryParam = this.selectedCategory === 'All' ? '' : this.selectedCategory;

    this.productService.getProducts(this.currentPage, this.pageSize, this.searchQuery, categoryParam, this.sortBy, this.sortDir)
      .subscribe({
        next: (response) => {
          this.products = response.content || response || [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || this.products.length;
        },
        error: (err) => {
          console.error("Error loading products", err);
          this.products = [];
        }
      });
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.target.value;
    this.currentPage = 0; // Always reset to page 1 when changing categories
    this.loadProducts();
  }

  onSearch() {
    this.currentPage = 0; // Reset to page 1 when searching
    this.loadProducts();
  }

  onSortChange(event: any) {
    const value = event.target.value.split('-');
    this.sortBy = value[0];
    this.sortDir = value[1];
    this.currentPage = 0; // Reset to page 1 when sorting changes
    this.loadProducts();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  // --- YOUR EXISTING METHODS (UNCHANGED) ---
  addToCart(product: any, quantityStr: string) {
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    const cartItem = {
      skuCode: product.skuCode,
      price: product.price,
      quantity: quantity
    };
    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        alert(`${product.name} was successfully added to your cart!`);
      },
      error: (err) => {
        console.error('Failed to add to cart', err);
        alert('Could not add item to cart. Please try again.');
      }
    });
  }

  goToCreateProductPage() {
    this.router.navigateByUrl('/add-product');
  }

  orderProduct(product: Product, quantity: string) {
    this.oidcSecurityService.userData$.subscribe(result => {
      const userDetails = {
        email: result.userData.email,
        firstName: result.userData.firstName,
        lastName: result.userData.lastName
      };

      if(!quantity) {
        this.orderFailed = true;
        this.orderSuccess = false;
        this.quantityIsNull = true;
      } else {
        const order: Order = {
          skuCode: product.skuCode,
          price: product.price,
          quantity: Number(quantity),
          userDetails: userDetails
        }

        this.orderService.orderProduct(order).subscribe(() => {
          this.orderSuccess = true;
        }, error => {
          this.orderFailed = false;
        })
      }
    })
  }

  protected readonly history = history;
}
