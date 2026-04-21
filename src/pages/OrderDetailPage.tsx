import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, MapPin, Phone, Truck, CreditCard, Clock, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, PaymentMethod, PaymentStatus, CartItem } from '@/types';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  received: { label: 'Recebido', color: 'bg-blue-500' },
  preparing: { label: 'Preparando', color: 'bg-yellow-500' },
  on_the_way: { label: 'A Caminho', color: 'bg-orange-500' },
  almost_there: { label: 'Quase Lá', color: 'bg-purple-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        const items: CartItem[] = (itemsData || []).map(item => ({
          id: item.product_id,
          name: item.product_name,
          brand: item.product_brand,
          volume: item.product_volume,
          price: Number(item.product_price),
          image: '', // No image stored in order_items
          minQuantity: item.min_quantity,
          unitLabel: item.unit_label,
          quantity: item.quantity,
        }));

        setOrder({
          id: orderData.id,
          items,
          total: Number(orderData.total),
          status: orderData.status as OrderStatus,
          paymentMethod: orderData.payment_method as PaymentMethod,
          paymentStatus: orderData.payment_status as PaymentStatus,
          createdAt: new Date(orderData.created_at),
          estimatedDelivery: orderData.estimated_delivery ? new Date(orderData.estimated_delivery) : undefined,
          customerName: orderData.customer_name || undefined,
          customerPhone: orderData.customer_phone || undefined,
          customerAddress: orderData.customer_address || undefined,
          validationCode: (orderData as any).validation_code || undefined,
        });
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Detalhes do Pedido" showBack />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Detalhes do Pedido" showBack />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Pedido não encontrado</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Pedidos
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const status = statusConfig[order.status];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Detalhes do Pedido" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sam-card p-4"
        >
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Encomenda</p>
              <p className="font-bold text-foreground">
                {format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: pt })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm text-white ${status.color} flex-shrink-0`}>
              {status.label}
            </span>
          </div>

          {order.validationCode && (
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-accent/10 border border-accent/20">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Código:</span>
              <span className="font-mono font-bold tracking-widest text-accent">{order.validationCode}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={`${
                order.status === 'received' ? 'text-blue-500' :
                order.status === 'delivered' ? 'text-sam-success' : 'text-orange-500'
              }`}>
                Pedido {order.status === 'received' ? 'recebido' : status.label.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className={`${order.paymentStatus === 'paid' ? 'text-sam-success' : 'text-amber-600'}`}>
                Pagamento {order.paymentStatus === 'paid' ? 'confirmado' : 'pendente'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sam-card p-4"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Entrega
          </h3>

          <div className="space-y-3">
            {order.customerAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">{order.customerAddress}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{order.customerPhone}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sam-card p-4"
        >
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Produtos ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.brand} • {item.volume}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-foreground">
                    {(item.price * item.minQuantity * item.quantity).toLocaleString()} MT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {item.minQuantity} {item.unitLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{order.total.toLocaleString()} MT</span>
          </div>

          {/* Payment Method */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Método de pagamento</span>
            <span className="text-sm text-foreground uppercase">{order.paymentMethod}</span>
          </div>
        </motion.div>

        {/* Track Order Button */}
        {order.status !== 'delivered' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              onClick={() => navigate('/tracking')} 
              className="w-full gap-2"
            >
              <Truck className="w-4 h-4" />
              Rastrear Encomenda
            </Button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
