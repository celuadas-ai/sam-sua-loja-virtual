import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Truck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const monthlyData = [
  { month: 'Jan', sales: 230000, orders: 156 },
  { month: 'Fev', sales: 245000, orders: 168 },
  { month: 'Mar', sales: 260000, orders: 175 },
];

const topProducts = [
  { name: 'Água Namaacha 0.5L', sales: 620, revenue: 15500 },
  { name: 'Água Namaacha 1.5L', sales: 435, revenue: 19575 },
  { name: 'Garrafão Natura 18.9L', sales: 210, revenue: 52500 },
  { name: 'Água Fonte Fresca 7L', sales: 148, revenue: 17760 },
];

const kpis = [
  {
    label: 'Receita Total',
    value: '943.000 MZN',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    label: 'Total de Encomendas',
    value: '683',
    change: '+8.2%',
    trend: 'up',
    icon: Package,
  },
  {
    label: 'Clientes Ativos',
    value: '234',
    change: '+15.3%',
    trend: 'up',
    icon: Users,
  },
  {
    label: 'Taxa de Entrega',
    value: '98.7%',
    change: '-0.2%',
    trend: 'down',
    icon: Truck,
  },
];

export default function AdminReports() {
  const maxSales = Math.max(...monthlyData.map((d) => d.sales));

  return (
    <AdminLayout title="Relatórios" subtitle="Análise de desempenho">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="sam-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-sam-success' : 'text-destructive'
                }`}
              >
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {kpi.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="sam-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Vendas Mensais (2024)
          </h2>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex items-center gap-4">
                <span className="w-8 text-sm text-muted-foreground">{data.month}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-lg transition-all duration-500"
                    style={{ width: `${(data.sales / maxSales) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-sm font-medium text-foreground text-right">
                  {(data.sales / 1000).toFixed(0)}k MZN
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="sam-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Produtos Mais Vendidos
          </h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? 'bg-yellow-500 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-700'
                        : index === 2
                        ? 'bg-amber-600 text-amber-100'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} unidades vendidas
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">
                  {product.revenue.toLocaleString()} MZN
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
