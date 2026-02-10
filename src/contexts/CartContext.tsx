import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Order, OrderStatus, PaymentMethod, PaymentStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  currentOrder: Order | null;
  createOrder: (paymentMethod: PaymentMethod, customerName?: string, customerPhone?: string, customerAddress?: string, customerCoords?: { lat: number; lng: number }) => Promise<void>;
  updateOrderStatus: (status: OrderStatus) => void;
  processPayment: () => void;
  completeOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
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
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
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

  const total = items.reduce((sum, item) => sum + item.price * item.minQuantity * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const createOrder = async (
    paymentMethod: PaymentMethod,
    customerName?: string,
    customerPhone?: string,
    customerAddress?: string,
    customerCoords?: { lat: number; lng: number }
  ) => {
    let dbOrder: Order | null = null;

    // Try to create order in database if user is authenticated
    if (user) {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total,
            payment_method: paymentMethod,
            payment_status: 'paid',
            status: 'received',
            customer_name: customerName || user.user_metadata?.full_name || user.email,
            customer_phone: customerPhone || user.user_metadata?.phone,
            customer_address: customerAddress,
            customer_latitude: customerCoords?.lat || null,
            customer_longitude: customerCoords?.lng || null,
            estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (!orderError && orderData) {
          // Insert order items
          const orderItems = items.map(item => ({
            order_id: orderData.id,
            product_id: item.id,
            product_name: item.name,
            product_brand: item.brand,
            product_volume: item.volume,
            product_price: item.price,
            quantity: item.quantity,
            min_quantity: item.minQuantity,
            unit_label: item.unitLabel,
          }));

          await supabase.from('order_items').insert(orderItems);

          dbOrder = {
            id: orderData.id,
            items: [...items],
            total: Number(orderData.total),
            status: orderData.status as OrderStatus,
            paymentMethod: orderData.payment_method as PaymentMethod,
            paymentStatus: orderData.payment_status as PaymentStatus,
            createdAt: new Date(orderData.created_at),
            estimatedDelivery: orderData.estimated_delivery ? new Date(orderData.estimated_delivery) : undefined,
            customerName: orderData.customer_name || undefined,
            customerPhone: orderData.customer_phone || undefined,
            customerAddress: orderData.customer_address || undefined,
          };
        }
      } catch (err) {
        console.error('Error creating order in database:', err);
      }
    }

    if (dbOrder) {
      setCurrentOrder(dbOrder);
      clearCart();
    } else {
      // Fallback to local order
      const order: Order = {
        id: `ORD-${Date.now()}`,
        items: [...items],
        total,
        status: 'received',
        paymentMethod,
        paymentStatus: 'paid',
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
      try {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', currentOrder.id);
      } catch (err) {
        console.error('Error confirming payment:', err);
      }
      setCurrentOrder({ ...currentOrder, paymentStatus: 'paid' });
    }
  };

  const updateOrderStatus = async (status: OrderStatus) => {
    if (currentOrder) {
      try {
        await supabase
          .from('orders')
          .update({ status })
          .eq('id', currentOrder.id);
      } catch (err) {
        console.error('Error updating order status:', err);
      }
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
