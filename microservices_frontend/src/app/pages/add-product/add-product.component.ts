import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { switchMap } from 'rxjs';
import { Product } from '../../model/product';
import { ProductService } from '../../services/product/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);

  // Must match the category filter on the home page
  categories = ['Smartphones', 'Laptops', 'Audio', 'Wearables', 'Gaming'];

  isAdmin = false;
  accessDenied = false;
  isSubmitting = false;
  productCreated = false;
  errorMessage = '';

  addProductForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    skuCode: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
    category: ['', [Validators.required]],
    price: [null, [Validators.required, Validators.min(0.01)]],
    quantity: [null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    imageURL: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    description: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // UI-only admin check by username
    this.oidcSecurityService.userData$.subscribe(result => {
      if (result.userData?.preferred_username === 'admin') {
        this.isAdmin = true;
        this.accessDenied = false;
      } else {
        this.accessDenied = true;
        setTimeout(() => { if (!this.isAdmin) this.router.navigateByUrl('/'); }, 2000);
      }
    });
  }

  onSubmit(): void {
    if (this.addProductForm.invalid) {
      this.addProductForm.markAllAsTouched();
      return;
    }

    const v = this.addProductForm.value;
    const product: Product = {
      name: v.name.trim(),
      skuCode: v.skuCode.trim(),
      category: v.category,
      price: v.price,
      imageURL: v.imageURL.trim(),
      description: v.description.trim()
    };

    this.isSubmitting = true;
    this.productCreated = false;
    this.errorMessage = '';

    // Product first (MongoDB, rejects duplicate SKUs), then its stock (MySQL)
    this.productService.createProduct(product).pipe(
      switchMap(() => this.productService.addStock(product.skuCode, v.quantity))
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.productCreated = true;
        this.addProductForm.reset({
          name: '', skuCode: '', category: '', price: null, quantity: null, imageURL: '', description: ''
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.status === 409
          ? 'A product with this SKU code already exists.'
          : 'Failed to create the product. Please try again.';
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.addProductForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasError(field: string, error: string): boolean {
    return !!this.addProductForm.get(field)?.hasError(error);
  }
}
