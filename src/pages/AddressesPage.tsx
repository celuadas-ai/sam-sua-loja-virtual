import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('user-addresses');
    return saved ? JSON.parse(saved) : [
      { id: '1', label: 'Casa', address: 'Av. Eduardo Mondlane, 123, Maputo', isDefault: true },
      { id: '2', label: 'Trabalho', address: 'Rua da Zambézia, 45, Maputo', isDefault: false },
    ];
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({ label: '', address: '' });

  useEffect(() => {
    localStorage.setItem('user-addresses', JSON.stringify(addresses));
  }, [addresses]);

  const handleSave = () => {
    if (!formData.label || !formData.address) {
      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    if (editingAddress) {
      setAddresses(prev =>
        prev.map(a =>
          a.id === editingAddress.id
            ? { ...a, label: formData.label, address: formData.address }
            : a
        )
      );
      toast({ title: 'Endereço atualizado' });
    } else {
      setAddresses(prev => [
        ...prev,
        { id: Date.now().toString(), label: formData.label, address: formData.address, isDefault: false },
      ]);
      toast({ title: 'Endereço adicionado' });
    }

    setFormData({ label: '', address: '' });
    setEditingAddress(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast({ title: 'Endereço removido' });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(a => ({ ...a, isDefault: a.id === id }))
    );
    toast({ title: 'Endereço padrão atualizado' });
  };

  const openEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({ label: address.label, address: address.address });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingAddress(null);
    setFormData({ label: '', address: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Meus Endereços" showBack />

      <div className="px-4 py-4 space-y-3">
        {addresses.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`sam-card p-4 ${address.isDefault ? 'border-primary' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                address.isDefault ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <MapPin className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{address.label}</p>
                  {address.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Padrão
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{address.address}</p>
              </div>

              <div className="flex gap-1">
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(address)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(address.id)}
                  disabled={address.isDefault}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={openNew}
              className="w-full sam-card p-4 flex items-center justify-center gap-2 border-dashed border-2"
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">Adicionar Endereço</span>
            </motion.button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nome (ex: Casa, Trabalho)
                </label>
                <Input
                  value={formData.label}
                  onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Casa"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Endereço completo
                </label>
                <Input
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Av. Eduardo Mondlane, 123"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              {editingAddress ? 'Guardar Alterações' : 'Adicionar'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <BottomNav />
    </div>
  );
}
