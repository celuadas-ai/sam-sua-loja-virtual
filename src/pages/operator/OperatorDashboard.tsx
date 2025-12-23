import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Phone, CheckCircle, Clock, Truck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockOrders } from '@/data/mockUsers';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderStatus } from '@/types';
import samLogo from '@/assets/sam-logo.png';

const statusConfig: Record<OrderStatus, { label: string; color: string; next?: OrderStatus }> = {
  received: { label: 'Recebido', color: 'bg-blue-500', next: 'preparing' },
  preparing: { label: 'Preparando', color: 'bg-yellow-500', next: 'on_the_way' },
  on_the_way: { label: 'Em Rota', color: 'bg-orange-500', next: 'almost_there' },
  almost_there: { label: 'Quase Lá', color: 'bg-purple-500', next: 'delivered' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
};

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.status !== 'delivered')
  );

  const handleAdvanceStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const nextStatus = statusConfig[order.status].next;
          if (nextStatus) {
            return { ...order, status: nextStatus };
          }
        }
        return order;
      }).filter((o) => o.status !== 'delivered')
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl p-1.5">
              <img src={samLogo} alt="SAM" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Operador</h1>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="sam-card p-4 text-center">
          <Clock className="w-6 h-6 mx-auto text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </div>
        <div className="sam-card p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto text-sam-success mb-2" />
          <p className="text-2xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground">Hoje</p>
        </div>
      </div>

      {/* Orders */}
      <div className="p-4 space-y-4">
        <h2 className="font-semibold text-foreground">Encomendas Ativas</h2>
        
        {orders.length === 0 ? (
          <div className="sam-card p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Sem encomendas pendentes</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const status = statusConfig[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="sam-card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono font-semibold text-foreground">{order.id}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs text-white mt-1 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="font-bold text-foreground">{order.total.toLocaleString()} MZN</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{order.customerAddress}</span>
                  </div>
                </div>

                {status.next && (
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleAdvanceStatus(order.id)}
                  >
                    <Truck className="w-4 h-4" />
                    {status.next === 'preparing' && 'Iniciar Preparação'}
                    {status.next === 'on_the_way' && 'Saiu para Entrega'}
                    {status.next === 'almost_there' && 'Quase a Chegar'}
                    {status.next === 'delivered' && 'Confirmar Entrega'}
                  </Button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
