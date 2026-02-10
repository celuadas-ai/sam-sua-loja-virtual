import { motion } from 'framer-motion';
import { Package, Users, Truck, TrendingUp, Clock, CheckCircle, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useProducts } from '@/hooks/useProducts';
import { useOperators } from '@/hooks/useOperators';
import { useOrders } from '@/hooks/useOrders';

export default function AdminDashboard() {
  const { products, isLoading: productsLoading } = useProducts();
  const { operators, isLoading: operatorsLoading } = useOperators();
  const { orders, loading: ordersLoading } = useOrders();
  
  const activeOperators = operators.filter(o => o.isActive).length;
  const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const todayOrders = orders.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      icon: Truck,
      label: 'Encomendas Hoje',
      value: ordersLoading ? '...' : todayOrders.length.toString(),
      change: '',
      color: 'bg-accent',
    },
    {
      icon: TrendingUp,
      label: 'Vendas Hoje (MZN)',
      value: ordersLoading ? '...' : todaySales.toLocaleString(),
      change: '',
      color: 'bg-sam-success',
    },
    {
      icon: Package,
      label: 'Produtos',
      value: productsLoading ? '...' : products.length.toString(),
      change: '',
      color: 'bg-sam-warning',
    },
    {
      icon: Users,
      label: 'Operadores Ativos',
      value: operatorsLoading ? '...' : activeOperators.toString(),
      change: '',
      color: 'bg-primary',
    },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    received: { label: 'Recebido', color: 'bg-blue-500' },
    preparing: { label: 'Preparando', color: 'bg-yellow-500' },
    on_the_way: { label: 'Em Rota', color: 'bg-orange-500' },
    delivered: { label: 'Entregue', color: 'bg-green-500' },
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral do sistema">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="sam-card p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                {stat.change && (
                  <p className="text-sam-success text-sm mt-1">{stat.change} vs ontem</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="sam-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Encomendas Recentes</h2>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {pendingOrders} pendentes
              </span>
              <span className="flex items-center gap-1 text-sam-success">
                <CheckCircle className="w-4 h-4" />
                {completedOrders} entregues
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma encomenda</p>
            ) : (
              orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-foreground">{order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {order.total.toLocaleString()} MZN
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                        statusLabels[order.status]?.color
                      }`}
                    >
                      {statusLabels[order.status]?.label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Operators Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="sam-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Desempenho dos Operadores
          </h2>

          <div className="space-y-4">
            {operatorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              operators.slice(0, 4).map((operator) => (
                <div
                  key={operator.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        operator.isActive ? 'bg-primary' : 'bg-muted-foreground'
                      }`}
                    >
                      {operator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{operator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {operator.isActive ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {operator.deliveriesCompleted}
                    </p>
                    <p className="text-xs text-muted-foreground">entregas</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
