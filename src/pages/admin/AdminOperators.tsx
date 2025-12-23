import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { mockOperators } from '@/data/mockUsers';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Operator } from '@/types';

export default function AdminOperators() {
  const [searchQuery, setSearchQuery] = useState('');
  const [operators, setOperators] = useState<Operator[]>(mockOperators);
  const { toast } = useToast();

  const filteredOperators = operators.filter((op) =>
    op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (operatorId: string) => {
    setOperators((prev) =>
      prev.map((op) =>
        op.id === operatorId ? { ...op, isActive: !op.isActive } : op
      )
    );
    toast({
      title: 'Estado atualizado',
      description: 'O estado do operador foi atualizado',
    });
  };

  const activeCount = operators.filter((o) => o.isActive).length;
  const inactiveCount = operators.filter((o) => !o.isActive).length;

  return (
    <AdminLayout
      title="Operadores"
      subtitle={`${activeCount} ativos, ${inactiveCount} inativos`}
    >
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar operadores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Operador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Operador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Nome completo" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Telefone" />
              <Input placeholder="Palavra-passe" type="password" />
              <Button className="w-full">Registrar Operador</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOperators.map((operator, index) => (
          <motion.div
            key={operator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="sam-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    operator.isActive ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
                >
                  {operator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{operator.name}</h3>
                  <p className="text-sm text-muted-foreground">{operator.email}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  operator.isActive
                    ? 'bg-sam-success/20 text-sam-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {operator.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Telefone</span>
                <span className="text-foreground">{operator.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entregas</span>
                <span className="text-foreground font-semibold">
                  {operator.deliveriesCompleted}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => toggleStatus(operator.id)}
              >
                {operator.isActive ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Ativar
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
}
