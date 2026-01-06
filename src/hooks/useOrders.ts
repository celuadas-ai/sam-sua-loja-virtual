import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Order, CartItem, PaymentMethod, OrderStatus, PaymentStatus } from '@/types';

interface DbOrder {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  operator_id: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_volume: string;
  product_price: number;
  quantity: number;
  min_quantity: number;
  unit_label: string;
  created_at: string;
}

// Convert DB order to app Order type
function mapDbOrderToOrder(dbOrder: DbOrder, items: CartItem[]): Order {
  return {
    id: dbOrder.id,
    items,
    total: Number(dbOrder.total),
    status: dbOrder.status as OrderStatus,
    paymentMethod: dbOrder.payment_method as PaymentMethod,
    paymentStatus: dbOrder.payment_status as PaymentStatus,
    createdAt: new Date(dbOrder.created_at),
    estimatedDelivery: dbOrder.estimated_delivery ? new Date(dbOrder.estimated_delivery) : undefined,
    customerName: dbOrder.customer_name || undefined,
    customerPhone: dbOrder.customer_phone || undefined,
    customerAddress: dbOrder.customer_address || undefined,
    operatorId: dbOrder.operator_id || undefined,
  };
}

// Convert DB order item to CartItem
function mapDbOrderItemToCartItem(item: DbOrderItem): CartItem {
  return {
    id: item.product_id,
    name: item.product_name,
    brand: item.product_brand,
    volume: item.product_volume,
    price: Number(item.product_price),
    quantity: item.quantity,
    minQuantity: item.min_quantity,
    unitLabel: item.unit_label,
    image: '', // Will be filled from products data if needed
  };
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's orders
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch all order items for these orders
      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Map orders with their items
      const mappedOrders = ordersData.map(order => {
        const orderItems = (itemsData || [])
          .filter(item => item.order_id === order.id)
          .map(mapDbOrderItemToCartItem);
        return mapDbOrderToOrder(order as DbOrder, orderItems);
      });

      setOrders(mappedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new order
  const createOrder = async (
    items: CartItem[],
    total: number,
    paymentMethod: PaymentMethod,
    customerName?: string,
    customerPhone?: string,
    customerAddress?: string
  ): Promise<Order | null> => {
    if (!user) return null;

    try {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'received',
          customer_name: customerName || user.name,
          customer_phone: customerPhone || user.phone,
          customer_address: customerAddress,
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

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

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const newOrder = mapDbOrderToOrder(orderData as DbOrder, items);
      setOrders(prev => [newOrder, ...prev]);
      
      return newOrder;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
      return null;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    }
  };

  // Confirm payment
  const confirmPayment = async (orderId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, paymentStatus: 'paid' } : order
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error confirming payment:', err);
      return false;
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as DbOrder;
            setOrders(prev =>
              prev.map(order =>
                order.id === updated.id
                  ? {
                      ...order,
                      status: updated.status as OrderStatus,
                      paymentStatus: updated.payment_status as PaymentStatus,
                    }
                  : order
              )
            );
          } else if (payload.eventType === 'INSERT') {
            // Refresh orders to get the new one with items
            fetchOrders();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchOrders]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    confirmPayment,
    refetch: fetchOrders,
  };
}
