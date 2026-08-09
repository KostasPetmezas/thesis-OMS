export interface Order {
  id?: number;
  orderNumber?: string;
  skuCode: string;
  price: number;
  quantity: number;
  userDetails?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}
export interface UserDetails {
  email: string;
  firstName: string;
  lastName: string;
}
