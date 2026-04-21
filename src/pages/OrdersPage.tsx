import { motion } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrders } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t.orders.title} showBack />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">A carregar encomendas...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (orders.length === 0) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-sam-success/10 text-sam-success';
      case 'on_the_way':
      case 'almost_there':
        return 'bg-orange-500/10 text-orange-500';
      case 'preparing':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t.orders.title} showBack />

      <div className="px-4 py-4 space-y-3">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="sam-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                order.status === 'delivered' ? 'bg-sam-success/10' : 'bg-primary/10'
              }`}>
                <Package className={`w-6 h-6 ${
                  order.status === 'delivered' ? 'text-sam-success' : 'text-primary'
                }`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground text-sm">
                    Encomenda {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: pt })}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {t.status[order.status as keyof typeof t.status] || order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.items.length} {order.items.length === 1 ? t.cart.item : t.cart.items} • {order.total.toLocaleString()} MT
                </p>
                <p className="text-xs mt-1 font-medium text-muted-foreground">
                  <span className={`${
                    order.status === 'delivered' ? 'text-sam-success' :
                    order.status === 'on_the_way' || order.status === 'almost_there' ? 'text-orange-500' :
                    order.status === 'preparing' ? 'text-yellow-600' : 'text-blue-500'
                  }`}>
                    {t.status[order.status as keyof typeof t.status] || order.status}
                  </span>
                  {' • '}
                  <span className={order.paymentStatus === 'paid' ? 'text-sam-success' : 'text-amber-500'}>
                    Pagamento {order.paymentStatus === 'paid' ? 'confirmado' : 'pendente'}
                  </span>
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
