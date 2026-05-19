import {Routes} from '@angular/router';
import {HomePageComponent} from "./pages/home-page/home-page.component";
import {AddProductComponent} from "./pages/add-product/add-product.component";
import {CartComponent} from "./pages/cart-page/cart.component";
import {OrderHistoryComponent} from "./pages/order-history/order-history.component";

export const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'add-product', component: AddProductComponent},
  {path: 'cart', component: CartComponent},
  { path: 'history', component: OrderHistoryComponent },
];
