import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Clock, CheckCircle, Truck, Package, Loader2, CreditCard, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useOrders } from '@/hooks/useOrders';
import { useOperators } from '@/hooks/useOperators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  received: { label: 'Recebido', color: 'bg-blue-500', icon: Package },
  preparing: { label: 'Preparando', color: 'bg-yellow-500', icon: Clock },
  on_the_way: { label: 'Em Rota', color: 'bg-orange-500', icon: Truck },
  almost_there: { label: 'Quase Lá', color: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: CheckCircle },
};

export default function AdminOrders() {
  const { orders, loading, confirmPayment } = useOrders();
  const { operators } = useOperators();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [savingOperator, setSavingOperator] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const orderNum = order.orderNumber ? `#${order.orderNumber}` : '';
    const matchesSearch =
      orderNum.includes(searchQuery) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <AdminLayout title="Encomendas" subtitle="A carregar...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Encomendas"
      subtitle={`${orders.length} encomendas totais`}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nº pedido ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sam-card overflow-hidden"
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-foreground w-[100px]">Nº Pedido</th>
                <th className="text-left p-4 font-semibold text-foreground w-[160px]">Cliente</th>
                <th className="text-left p-4 font-semibold text-foreground w-[100px]">Total</th>
                <th className="text-left p-4 font-semibold text-foreground w-[100px]">Pagamento</th>
                <th className="text-left p-4 font-semibold text-foreground w-[110px]">Estado</th>
                <th className="text-left p-4 font-semibold text-foreground w-[110px]">Data</th>
                <th className="text-center p-4 font-semibold text-foreground w-[70px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-semibold text-primary w-[100px]">
                      #{order.orderNumber || '—'}
                    </td>
                    <td className="p-4 w-[160px]">
                      <div>
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-foreground w-[100px]">
                      {order.total.toLocaleString()} MZN
                    </td>
                    <td className="p-4 w-[100px]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid'
                            ? 'bg-sam-success/20 text-sam-success'
                            : 'bg-sam-warning/20 text-sam-warning'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-4 w-[110px]">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground w-[110px]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4 text-center w-[70px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Encomenda</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nº Pedido</span>
                <span className="font-mono font-semibold text-primary">#{selectedOrder.orderNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone</span>
                <span>{selectedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endereço</span>
                <span className="text-right max-w-[200px]">{selectedOrder.customerAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-lg">
                  {selectedOrder.total.toLocaleString()} MZN
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pagamento</span>
                {selectedOrder.paymentStatus === 'paid' ? (
                  <span className="text-sm font-medium text-sam-success">✓ Pago</span>
                ) : (
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={async () => {
                      const success = await confirmPayment(selectedOrder.id);
                      if (success) {
                        setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid' });
                      }
                    }}
                  >
                    <CreditCard className="w-3 h-3" />
                    Confirmar Pagamento
                  </Button>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Operador</span>
                <Select
                  value={selectedOperatorId}
                  onValueChange={setSelectedOperatorId}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Atribuir" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators
                      .filter((o) => o.isActive)
                      .map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedOperatorId && selectedOperatorId !== (selectedOrder.operatorId || '') && (
                <Button
                  className="w-full gap-2"
                  disabled={savingOperator}
                  onClick={async () => {
                    setSavingOperator(true);
                    try {
                      const { error } = await (await import('@/integrations/supabase/client')).supabase
                        .from('orders')
                        .update({ operator_id: selectedOperatorId })
                        .eq('id', selectedOrder.id);
                      if (error) throw error;
                      setSelectedOrder({ ...selectedOrder, operatorId: selectedOperatorId });
                      const { toast } = await import('sonner');
                      toast.success('Operador atribuído com sucesso');
                    } catch (err) {
                      const { toast } = await import('sonner');
                      toast.error('Erro ao atribuir operador');
                    } finally {
                      setSavingOperator(false);
                    }
                  }}
                >
                  <Save className="w-4 h-4" />
                  {savingOperator ? 'A guardar...' : 'Salvar'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
