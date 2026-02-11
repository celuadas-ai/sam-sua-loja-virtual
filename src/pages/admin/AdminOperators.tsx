import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useOperators } from '@/hooks/useOperators';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Operator } from '@/types';

export default function AdminOperators() {
  const [searchQuery, setSearchQuery] = useState('');
  const { operators, isLoading, addOperator, updateOperator, deleteOperator, toggleStatus } = useOperators();
  const { toast } = useToast();
  
  // Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const filteredOperators = operators.filter((op) =>
    op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '' });
  };

  const handleAddOperator = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const result = await addOperator({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      isActive: true,
    });
    setIsSubmitting(false);

    if (result) {
      toast({
        title: 'Operador registrado',
        description: `${formData.name} foi adicionado com sucesso`,
      });
      resetForm();
      setIsAddOpen(false);
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o operador',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (operator: Operator) => {
    setEditingOperator(operator);
    setFormData({
      name: operator.name,
      email: operator.email,
      phone: operator.phone,
      password: '',
    });
    setIsEditOpen(true);
  };

  const handleUpdateOperator = async () => {
    if (!editingOperator) return;
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const success = await updateOperator(editingOperator.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });
    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Operador atualizado',
        description: `${formData.name} foi atualizado com sucesso`,
      });
      resetForm();
      setIsEditOpen(false);
      setEditingOperator(null);
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o operador',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOperator = async (operator: Operator) => {
    const success = await deleteOperator(operator.id);
    if (success) {
      toast({
        title: 'Operador removido',
        description: `${operator.name} foi removido com sucesso`,
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o operador',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (operator: Operator) => {
    const success = await toggleStatus(operator.id);
    if (success) {
      toast({
        title: 'Estado atualizado',
        description: `${operator.name} foi ${operator.isActive ? 'desativado' : 'ativado'}`,
      });
    }
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

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input 
                  id="name"
                  placeholder="Nome completo" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email"
                  placeholder="Email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input 
                  id="phone"
                  placeholder="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe *</Label>
                <Input 
                  id="password"
                  placeholder="Palavra-passe" 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleAddOperator} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Registrar Operador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Operador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome completo *</Label>
              <Input 
                id="edit-name"
                placeholder="Nome completo" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input 
                id="edit-email"
                placeholder="Email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone *</Label>
              <Input 
                id="edit-phone"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleUpdateOperator} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Operators Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
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
                onClick={() => handleToggleStatus(operator)}
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleEditClick(operator)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover operador?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O operador {operator.name} será removido permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteOperator(operator)}>
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </AdminLayout>
  );
}
