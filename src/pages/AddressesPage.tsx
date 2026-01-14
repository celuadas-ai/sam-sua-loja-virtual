import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAddresses, UserAddress } from '@/hooks/useAddresses';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AddressesPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { addresses, isLoading, addAddress, updateAddress, deleteAddress, setDefault } = useAddresses();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [formData, setFormData] = useState({ label: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.label || !formData.address) {
      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      if (editingAddress) {
        const success = await updateAddress(editingAddress.id, {
          label: formData.label,
          address: formData.address,
        });
        if (success) {
          toast({ title: 'Endereço atualizado' });
        } else {
          toast({ title: 'Erro ao atualizar', variant: 'destructive' });
        }
      } else {
        const result = await addAddress({
          label: formData.label,
          address: formData.address,
        });
        if (result) {
          toast({ title: 'Endereço adicionado' });
        } else {
          toast({ title: 'Erro ao adicionar', variant: 'destructive' });
        }
      }

      setFormData({ label: '', address: '' });
      setEditingAddress(null);
      setIsDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteAddress(id);
    if (success) {
      toast({ title: 'Endereço removido' });
    } else {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const handleSetDefault = async (id: string) => {
    const success = await setDefault(id);
    if (success) {
      toast({ title: 'Endereço padrão atualizado' });
    } else {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const openEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({ label: address.label, address: address.address });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingAddress(null);
    setFormData({ label: '', address: '' });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Meus Endereços" showBack />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">A carregar endereços...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Meus Endereços" showBack />

      <div className="px-4 py-4 space-y-3">
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sam-card p-8 text-center"
          >
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Ainda não tem endereços guardados</p>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Endereço
            </Button>
          </motion.div>
        ) : (
          <>
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

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={openNew}
              className="w-full sam-card p-4 flex items-center justify-center gap-2 border-dashed border-2"
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">Adicionar Endereço</span>
            </motion.button>
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                editingAddress ? 'Guardar Alterações' : 'Adicionar'
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <BottomNav />
    </div>
  );
}
