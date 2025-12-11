export interface Product {
  id: string;
  name: string;
  brand: string;
  volume: string;
  price: number;
  image: string;
  minQuantity: number;
  unitLabel: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  estimatedDelivery?: Date;
}

export type PaymentStatus = 'pending' | 'paid';

export type OrderStatus = 
  | 'received'
  | 'preparing'
  | 'on_the_way'
  | 'almost_there'
  | 'delivered';

export type PaymentMethod = 'mpesa' | 'emola' | 'pos' | 'cash';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}
