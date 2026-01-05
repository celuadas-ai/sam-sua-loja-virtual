import { motion } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useLanguage } from '@/contexts/LanguageContext';

const mockOrders = [
  {
    id: 'ORD-001',
    date: '08 Dez 2025',
    total: 295,
    items: 4,
    status: 'delivered',
  },
  {
    id: 'ORD-002',
    date: '05 Dez 2025',
    total: 180,
    items: 2,
    status: 'delivered',
  },
  {
    id: 'ORD-003',
    date: '01 Dez 2025',
    total: 450,
    items: 6,
    status: 'delivered',
  },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (mockOrders.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t.orders.title} showBack />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t.orders.noOrders}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {t.orders.noOrdersMessage}
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className="sam-button-accent"
          >
            {t.orders.orderNow}
          </motion.button>
        </motion.div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t.orders.title} showBack />

      <div className="px-4 py-4 space-y-3">
        {mockOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="sam-card p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sam-success/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-sam-success" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground">{order.id}</p>
                  <span className="text-xs bg-sam-success/10 text-sam-success px-2 py-1 rounded-full">
                    {t.status[order.status as keyof typeof t.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.date} • {order.items} {order.items === 1 ? t.cart.item : t.cart.items}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {order.total} MT
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
