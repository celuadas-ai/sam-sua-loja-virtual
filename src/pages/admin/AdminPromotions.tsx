import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { mockPromotions } from '@/data/mockUsers';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Promotion } from '@/types';

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const { toast } = useToast();

  const togglePromotion = (promoId: string) => {
    setPromotions((prev) =>
      prev.map((p) =>
        p.id === promoId ? { ...p, isActive: !p.isActive } : p
      )
    );
    toast({
      title: 'Promoção atualizada',
      description: 'O estado da promoção foi alterado',
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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Promoção</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Nome da promoção" />
              <Input placeholder="Descrição" />
              <Input placeholder="Desconto (%)" type="number" min="1" max="100" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Data início
                  </label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Data fim
                  </label>
                  <Input type="date" />
                </div>
              </div>
              <Button className="w-full">Criar Promoção</Button>
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
                  onCheckedChange={() => togglePromotion(promo.id)}
                />
                <span className="text-sm text-muted-foreground">
                  {promo.isActive ? 'Desativar' : 'Ativar'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
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
