import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Phone, MessageCircle, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { OrderTracker } from '@/components/OrderTracker';
import { useCart } from '@/contexts/CartContext';
import { OrderStatus } from '@/types';

const statusSequence: OrderStatus[] = [
  'received',
  'preparing',
  'on_the_way',
  'almost_there',
  'delivered',
];

export default function TrackingPage() {
  const navigate = useNavigate();
  const { currentOrder, updateOrderStatus } = useCart();
  const [eta, setEta] = useState(30);

  // Simulate order progress
  useEffect(() => {
    if (!currentOrder || currentOrder.status === 'delivered') return;

    const currentIndex = statusSequence.indexOf(currentOrder.status);
    if (currentIndex < statusSequence.length - 1) {
      const timer = setTimeout(() => {
        updateOrderStatus(statusSequence[currentIndex + 1]);
        setEta((prev) => Math.max(0, prev - 8));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentOrder, updateOrderStatus]);

  useEffect(() => {
    if (currentOrder?.status === 'delivered') {
      setTimeout(() => {
        navigate('/confirmation');
      }, 1500);
    }
  }, [currentOrder?.status, navigate]);

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Rastreamento" showBack />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Nenhuma encomenda ativa
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Faça uma encomenda para acompanhar a entrega
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className="sam-button-accent"
          >
            Ver produtos
          </motion.button>
        </motion.div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Rastreamento" showBack />

      {/* Map Placeholder */}
      <div className="relative h-48 bg-sam-light-blue overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-sam-glow"
            >
              <MapPin className="w-8 h-8 text-accent-foreground" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-lg shadow-sam text-sm font-medium"
            >
              🛵 A caminho
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

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
                  Tempo estimado
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {eta} min
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
          Pedido: <span className="font-mono font-semibold text-foreground">{currentOrder.id}</span>
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
          <OrderTracker status={currentOrder.status} />
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
