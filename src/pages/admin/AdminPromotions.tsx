import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { usePromotions } from '@/hooks/usePromotions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Promotion } from '@/types';

export default function AdminPromotions() {
  const { promotions, addPromotion, updatePromotion, deletePromotion, togglePromotion } = usePromotions();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercent: '',
    startDate: '',
    endDate: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountPercent: '',
      startDate: '',
      endDate: '',
    });
    setEditingPromotion(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      name: promo.name,
      description: promo.description,
      discountPercent: promo.discountPercent.toString(),
      startDate: promo.startDate.toISOString().split('T')[0],
      endDate: promo.endDate.toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.discountPercent || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const discount = parseInt(formData.discountPercent);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      toast({
        title: 'Erro',
        description: 'O desconto deve ser entre 1 e 100%',
        variant: 'destructive',
      });
      return;
    }

    const promotionData = {
      name: formData.name,
      description: formData.description,
      discountPercent: discount,
      productIds: editingPromotion?.productIds || [],
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      isActive: editingPromotion?.isActive ?? true,
    };

    if (editingPromotion) {
      updatePromotion(editingPromotion.id, promotionData);
      toast({
        title: 'Promoção atualizada',
        description: `A promoção "${formData.name}" foi atualizada com sucesso`,
      });
    } else {
      addPromotion(promotionData);
      toast({
        title: 'Promoção criada',
        description: `A promoção "${formData.name}" foi criada com sucesso`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (promo: Promotion) => {
    deletePromotion(promo.id);
    toast({
      title: 'Promoção eliminada',
      description: `A promoção "${promo.name}" foi eliminada`,
    });
  };

  const handleToggle = (promo: Promotion) => {
    togglePromotion(promo.id);
    toast({
      title: 'Promoção atualizada',
      description: promo.isActive ? 'Promoção desativada' : 'Promoção ativada',
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const activeCount = promotions.filter((p) => p.isActive).length;

  return (
    <AdminLayout
      title="Promoções"
      subtitle={`${activeCount} promoções ativas`}
    >
      {/* Actions */}
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="w-4 h-4" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Editar Promoção' : 'Criar Promoção'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Nome da promoção *
                </label>
                <Input
                  placeholder="Ex: Desconto Verão"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Descrição
                </label>
                <Input
                  placeholder="Ex: 15% de desconto em toda a linha"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Desconto (%) *
                </label>
                <Input
                  placeholder="Ex: 15"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Data início *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Data fim *
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSubmit}>
                {editingPromotion ? 'Guardar Alterações' : 'Criar Promoção'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`sam-card p-6 relative overflow-hidden ${
              promo.isActive ? 'border-l-4 border-l-sam-success' : ''
            }`}
          >
            {/* Badge */}
            <div
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                promo.isActive
                  ? 'bg-sam-success/20 text-sam-success'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {promo.isActive ? 'Ativa' : 'Inativa'}
            </div>

            {/* Content */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{promo.name}</h3>
                <p className="text-muted-foreground text-sm">{promo.description}</p>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Desconto:</span>
                <span className="font-semibold text-accent">{promo.discountPercent}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Período:</span>
                <span className="text-foreground">
                  {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Switch
                  checked={promo.isActive}
                  onCheckedChange={() => handleToggle(promo)}
                />
                <span className="text-sm text-muted-foreground">
                  {promo.isActive ? 'Desativar' : 'Ativar'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(promo)}>
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
                      <AlertDialogTitle>Eliminar promoção?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja eliminar a promoção "{promo.name}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(promo)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {promotions.length === 0 && (
        <div className="sam-card p-12 text-center">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Sem promoções</h3>
          <p className="text-muted-foreground">Crie a primeira promoção para começar</p>
        </div>
      )}
    </AdminLayout>
  );
}
