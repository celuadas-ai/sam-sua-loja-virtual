import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Edit2, Trash2, Check, Smartphone, Banknote } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'emola' | 'card';
  label: string;
  details: string;
  isDefault: boolean;
}

const typeConfig = {
  mpesa: { icon: Smartphone, label: 'M-Pesa', color: 'bg-red-500' },
  emola: { icon: Smartphone, label: 'e-Mola', color: 'bg-orange-500' },
  card: { icon: CreditCard, label: 'Cartão', color: 'bg-blue-500' },
};

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('payment-methods');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'mpesa', label: 'M-Pesa Principal', details: '84 123 4567', isDefault: true },
      { id: '2', type: 'emola', label: 'e-Mola', details: '85 987 6543', isDefault: false },
    ];
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({ type: 'mpesa' as PaymentMethod['type'], label: '', details: '' });

  useEffect(() => {
    localStorage.setItem('payment-methods', JSON.stringify(methods));
  }, [methods]);

  const handleSave = () => {
    if (!formData.label || !formData.details) {
      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    if (editingMethod) {
      setMethods(prev =>
        prev.map(m =>
          m.id === editingMethod.id
            ? { ...m, type: formData.type, label: formData.label, details: formData.details }
            : m
        )
      );
      toast({ title: 'Método de pagamento atualizado' });
    } else {
      setMethods(prev => [
        ...prev,
        { id: Date.now().toString(), type: formData.type, label: formData.label, details: formData.details, isDefault: false },
      ]);
      toast({ title: 'Método de pagamento adicionado' });
    }

    setFormData({ type: 'mpesa', label: '', details: '' });
    setEditingMethod(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Método de pagamento removido' });
  };

  const handleSetDefault = (id: string) => {
    setMethods(prev =>
      prev.map(m => ({ ...m, isDefault: m.id === id }))
    );
    toast({ title: 'Método padrão atualizado' });
  };

  const openEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({ type: method.type, label: method.label, details: method.details });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingMethod(null);
    setFormData({ type: 'mpesa', label: '', details: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Métodos de Pagamento" showBack />

      <div className="px-4 py-4 space-y-3">
        {methods.map((method, index) => {
          const config = typeConfig[method.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`sam-card p-4 ${method.isDefault ? 'border-primary' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{method.label}</p>
                    {method.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.label} • {method.details}
                  </p>
                </div>

                <div className="flex gap-1">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(method)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(method.id)}
                    disabled={method.isDefault}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={openNew}
              className="w-full sam-card p-4 flex items-center justify-center gap-2 border-dashed border-2"
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">Adicionar Método</span>
            </motion.button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? 'Editar Método' : 'Novo Método de Pagamento'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Tipo
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: PaymentMethod['type']) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="emola">e-Mola</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nome
                </label>
                <Input
                  value={formData.label}
                  onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="M-Pesa Principal"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  {formData.type === 'card' ? 'Últimos 4 dígitos' : 'Número de telefone'}
                </label>
                <Input
                  value={formData.details}
                  onChange={e => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder={formData.type === 'card' ? '4567' : '84 123 4567'}
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              {editingMethod ? 'Guardar Alterações' : 'Adicionar'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <BottomNav />
    </div>
  );
}
