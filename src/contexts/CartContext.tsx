import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Order, OrderStatus, PaymentMethod } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  currentOrder: Order | null;
  createOrder: (paymentMethod: PaymentMethod) => void;
  updateOrderStatus: (status: OrderStatus) => void;
  completeOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Start with minimum quantity for first add
      return [...prev, { ...product, quantity: product.minQuantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;
    
    // Don't allow quantity below minimum
    if (quantity < item.minQuantity) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const createOrder = (paymentMethod: PaymentMethod) => {
    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: [...items],
      total,
      status: 'received',
      paymentMethod,
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
    setCurrentOrder(order);
    clearCart();
  };

  const updateOrderStatus = (status: OrderStatus) => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, status });
    }
  };

  const completeOrder = () => {
    setCurrentOrder(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        currentOrder,
        createOrder,
        updateOrderStatus,
        completeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
