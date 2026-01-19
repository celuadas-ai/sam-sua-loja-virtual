import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Calendar, Percent, Package, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { usePromotionsDb } from '@/hooks/usePromotionsDb';
import { useProducts } from '@/hooks/useProducts';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Promotion } from '@/types';

export default function AdminPromotions() {
  const { promotions, isLoading, addPromotion, updatePromotion, deletePromotion, togglePromotion } = usePromotionsDb();
  const { products } = useProducts();
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
    selectedProducts: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountPercent: '',
      startDate: '',
      endDate: '',
      selectedProducts: [],
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
      selectedProducts: promo.productIds || [],
    });
    setIsDialogOpen(true);
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId],
    }));
  };

  const selectAllProducts = () => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: products.map((p) => p.id),
    }));
  };

  const clearAllProducts = () => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: [],
    }));
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

    if (formData.selectedProducts.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um produto',
        variant: 'destructive',
      });
      return;
    }

    const promotionData = {
      name: formData.name,
      description: formData.description,
      discountPercent: discount,
      productIds: formData.selectedProducts,
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

  const getProductNames = (productIds: string[]) => {
    return productIds
      .map((id) => {
        const product = products.find((p) => p.id === id);
        return product ? `${product.name} ${product.volume}` : null;
      })
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');
  };

  const activeCount = promotions.filter((p) => p.isActive).length;

  if (isLoading) {
    return (
      <AdminLayout title="Promoções" subtitle="A carregar...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Editar Promoção' : 'Criar Promoção'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Product Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-muted-foreground">
                    Produtos aplicáveis * ({formData.selectedProducts.length} selecionados)
                  </label>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={selectAllProducts}
                    >
                      Selecionar todos
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={clearAllProducts}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-48 border rounded-lg p-3">
                  <div className="space-y-2">
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={formData.selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleProductToggle(product.id)}
                        />
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {product.name} - {product.volume}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.brand} • {product.price.toLocaleString()} MT
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
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
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Produtos:</span>
                <span className="text-foreground truncate">
                  {promo.productIds.length > 0 
                    ? `${getProductNames(promo.productIds)}${promo.productIds.length > 3 ? ` +${promo.productIds.length - 3}` : ''}`
                    : 'Nenhum produto'}
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
