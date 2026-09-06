import {Routes} from '@angular/router';
import {HomePageComponent} from "./pages/home-page/home-page.component";
import {AddProductComponent} from "./pages/add-product/add-product.component";
import {CartComponent} from "./pages/cart-page/cart.component";
import {OrderHistoryComponent} from "./pages/order-history/order-history.component";
import { ProductPageComponent } from './pages/product-page/product-page.component';
import {AdminPageComponent} from "./pages/admin-page/admin-page.component";

export const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'add-product', component: AddProductComponent},
  {path: 'cart', component: CartComponent},
  { path: 'history', component: OrderHistoryComponent },
  { path: 'product/:skuCode', component: ProductPageComponent },
  { path: 'admin' , component: AdminPageComponent },
  { path: 'unauthorized', redirectTo: '', pathMatch: 'full' },
];
