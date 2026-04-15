export interface Product {
  id: string;
  name: string;
  brand: string;
  volume: string;
  price: number;
  image: string;
  minQuantity: number;
  unitLabel: string;
  isPromo?: boolean;
  promoPrice?: number;
  sku?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber?: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  estimatedDelivery?: Date;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerLatitude?: number;
  customerLongitude?: number;
  operatorId?: string;
  validationCode?: string;
}

export type PaymentStatus = 'pending' | 'paid';

export type OrderStatus = 
  | 'received'
  | 'preparing'
  | 'on_the_way'
  | 'almost_there'
  | 'delivered';

export type PaymentMethod = 'mpesa' | 'emola' | 'pos' | 'cash';

export type UserRole = 'customer' | 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
}

export interface Operator extends User {
  userId?: string;
  role: 'operator';
  isActive: boolean;
  deliveriesCompleted: number;
  storeId?: string;
  storeName?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  productIds: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
