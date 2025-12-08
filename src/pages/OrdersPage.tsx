import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

const mockOrders = [
  {
    id: 'ORD-001',
    date: '08 Dez 2025',
    total: 295,
    items: 4,
    status: 'Entregue',
  },
  {
    id: 'ORD-002',
    date: '05 Dez 2025',
    total: 180,
    items: 2,
    status: 'Entregue',
  },
  {
    id: 'ORD-003',
    date: '01 Dez 2025',
    total: 450,
    items: 6,
    status: 'Entregue',
  },
];

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Entregas Concluídas" showBack />

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
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.date} • {order.items} itens
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
