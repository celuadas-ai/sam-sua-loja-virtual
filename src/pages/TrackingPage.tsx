import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Phone, MessageCircle, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { OrderTracker } from '@/components/OrderTracker';
import { DeliveryMap } from '@/components/DeliveryMap';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrders } from '@/hooks/useOrders';
import { useStores } from '@/hooks/useStores';
import { haversineDistance } from '@/utils/distance';
import { Order } from '@/types';

export default function TrackingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentOrder } = useCart();
  const { orders, loading } = useOrders();
  const { stores } = useStores();

  // Find all active orders (non-delivered)
  const activeOrders: Order[] = useMemo(() => {
    const result: Order[] = [];
    // Add currentOrder from cart (just placed) if active
    if (currentOrder && currentOrder.status !== 'delivered') {
      result.push(currentOrder);
    }
    // Add active orders from DB (avoid duplicates)
    for (const o of orders) {
      if (o.status !== 'delivered' && !result.some(r => r.id === o.id)) {
        result.push(o);
      }
    }
    return result;
  }, [currentOrder, orders]);

  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const activeOrder: Order | null = activeOrders[selectedOrderIndex] || null;

  // Calculate real ETA based on distance
  const eta = useMemo(() => {
    if (!activeOrder) return 0;

    if (activeOrder.status === 'delivered') return 0;

    // If order has coordinates, calculate from nearest store
    if (activeOrder.customerLatitude && activeOrder.customerLongitude && stores.length > 0) {
      let minDist = Infinity;
      for (const store of stores) {
        const dist = haversineDistance(
          activeOrder.customerLatitude, activeOrder.customerLongitude,
          store.latitude, store.longitude
        );
        if (dist < minDist) minDist = dist;
      }
      // ~3 min/km base + preparation time based on status
      const baseMinutes = Math.round(minDist * 3);
      switch (activeOrder.status) {
        case 'received': return baseMinutes + 15;
        case 'preparing': return baseMinutes + 10;
        case 'on_the_way': return baseMinutes;
        case 'almost_there': return Math.max(Math.round(baseMinutes * 0.3), 2);
        default: return 0;
      }
    }

    // Fallback ETA based on status
    switch (activeOrder.status) {
      case 'received': return 30;
      case 'preparing': return 20;
      case 'on_the_way': return 12;
      case 'almost_there': return 5;
      default: return 0;
    }
  }, [activeOrder, stores]);

  // Navigate to confirmation when delivered
  useEffect(() => {
    if (activeOrder?.status === 'delivered') {
      const timer = setTimeout(() => {
        navigate('/confirmation');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeOrder?.status, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t.tracking.title} showBack />
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t.tracking.title} showBack />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t.tracking.noActiveOrders}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {t.tracking.noActiveOrdersMessage}
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className="sam-button-accent"
          >
            {t.tracking.orderNow}
          </motion.button>
        </motion.div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t.tracking.title} showBack />

      {/* Google Maps with Realtime Tracking */}
      <DeliveryMap 
        status={activeOrder.status} 
        destinationAddress={activeOrder.customerAddress}
        destinationCoords={
          activeOrder.customerLatitude && activeOrder.customerLongitude
            ? { lat: activeOrder.customerLatitude, lng: activeOrder.customerLongitude }
            : undefined
        }
        orderId={activeOrder.id}
      />

      {/* ETA Card */}
      <div className="px-4 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sam-card p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.tracking.estimatedArrival}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {eta > 0 ? `${eta} min` : 'Entregue'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground"
              >
                <Phone className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground"
              >
                <MessageCircle className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Order ID */}
      <div className="px-4 py-4">
        <p className="text-sm text-muted-foreground">
          {t.tracking.order}: <span className="font-mono font-semibold text-foreground">{activeOrder.id.slice(0, 8)}...</span>
        </p>
      </div>

      {/* Tracker */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sam-card p-4"
        >
          <OrderTracker status={activeOrder.status} />
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
