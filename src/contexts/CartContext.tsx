import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Order, OrderStatus, PaymentMethod } from '@/types';
import { useOrders } from '@/hooks/useOrders';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  currentOrder: Order | null;
  createOrder: (paymentMethod: PaymentMethod, customerName?: string, customerPhone?: string, customerAddress?: string) => Promise<void>;
  updateOrderStatus: (status: OrderStatus) => void;
  processPayment: () => void;
  completeOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { createOrder: createDbOrder, updateOrderStatus: updateDbOrderStatus, confirmPayment } = useOrders();

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
      // Start with 1 pack/box (quantity represents number of packs, not units)
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // Quantity represents number of packs/boxes, minimum is 1
    if (quantity < 1) {
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

  // Total = unit price × minQuantity (units per pack) × number of packs
  const total = items.reduce((sum, item) => sum + item.price * item.minQuantity * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const createOrder = async (
    paymentMethod: PaymentMethod,
    customerName?: string,
    customerPhone?: string,
    customerAddress?: string
  ) => {
    // Try to create order in database
    const dbOrder = await createDbOrder(
      items,
      total,
      paymentMethod,
      customerName,
      customerPhone,
      customerAddress
    );

    if (dbOrder) {
      setCurrentOrder(dbOrder);
      clearCart();
    } else {
      // Fallback to local order if database fails
      const order: Order = {
        id: `ORD-${Date.now()}`,
        items: [...items],
        total,
        status: 'received',
        paymentMethod,
        paymentStatus: 'pending',
        createdAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000),
        customerName,
        customerPhone,
        customerAddress,
      };
      setCurrentOrder(order);
      clearCart();
    }
  };

  const processPayment = async () => {
    if (currentOrder) {
      const success = await confirmPayment(currentOrder.id);
      if (success) {
        setCurrentOrder({ ...currentOrder, paymentStatus: 'paid' });
      }
    }
  };

  const updateOrderStatus = async (status: OrderStatus) => {
    if (currentOrder) {
      await updateDbOrderStatus(currentOrder.id, status);
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
        processPayment,
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
