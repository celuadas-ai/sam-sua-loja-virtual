import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Edit2, Trash2, Smartphone } from 'lucide-react';
import mpesaLogo from '@/assets/mpesa-logo.png';
import emolaLogo from '@/assets/emola-logo.png';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
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
              className={`sam-card p-4 flex items-start gap-3 cursor-pointer ${method.isDefault ? 'border-primary' : ''}`}
              onClick={() => handleSetDefault(method.id)}
            >
                {method.type === 'mpesa' ? (
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-border">
                    <img src={mpesaLogo} alt="M-Pesa" className="w-7 h-7 object-contain" />
                  </div>
                ) : method.type === 'emola' ? (
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-border">
                    <img src={emolaLogo} alt="e-Mola" className="w-7 h-7 object-contain" />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                )}

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

                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
            </motion.div>
          );
        })}

        <div className="w-full sam-card p-4 flex flex-col items-center justify-center gap-1 border-dashed border-2 opacity-60">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Adicionar Método</span>
          </div>
          <span className="text-xs text-muted-foreground">Em breve disponível</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
