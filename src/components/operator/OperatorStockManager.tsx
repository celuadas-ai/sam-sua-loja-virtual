import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Minus, Trash2, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOperatorStock, StockItem } from '@/hooks/useOperatorStock';
import { toast } from 'sonner';

interface OperatorStockManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OperatorStockManager({ isOpen, onClose }: OperatorStockManagerProps) {
  const { stock, loading, updateStock, removeFromStock, availableProducts } = useOperatorStock();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [addingProduct, setAddingProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const handleStartEdit = (item: StockItem) => {
    setEditingId(item.productId);
    setEditQuantity(item.quantity);
  };

  const handleSaveEdit = async (productId: string) => {
    setSaving(true);
    const success = await updateStock(productId, editQuantity);
    setSaving(false);
    
    if (success) {
      toast.success('Stock atualizado');
      setEditingId(null);
    } else {
      toast.error('Erro ao atualizar stock');
    }
  };

  const handleRemove = async (productId: string) => {
    setSaving(true);
    const success = await removeFromStock(productId);
    setSaving(false);
    
    if (success) {
      toast.success('Produto removido do stock');
    } else {
      toast.error('Erro ao remover produto');
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) {
      toast.error('Selecione um produto');
      return;
    }
    
    setSaving(true);
    const success = await updateStock(selectedProductId, newQuantity);
    setSaving(false);
    
    if (success) {
      toast.success('Produto adicionado ao stock');
      setAddingProduct(false);
      setSelectedProductId('');
      setNewQuantity(1);
    } else {
      toast.error('Erro ao adicionar produto');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-card w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Stock do Carro</h2>
              <p className="text-xs text-muted-foreground">Gerencie o seu inventário</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Add Product Button */}
              {!addingProduct && (
                <Button
                  variant="outline"
                  className="w-full mb-4 gap-2 border-dashed"
                  onClick={() => setAddingProduct(true)}
                  disabled={availableProducts.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Produto
                </Button>
              )}

              {/* Add Product Form */}
              <AnimatePresence>
                {addingProduct && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                      <select
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                        className="w-full p-3 rounded-lg bg-background border border-border text-foreground"
                      >
                        <option value="">Selecionar produto...</option>
                        {availableProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.brand} ({product.volume})
                          </option>
                        ))}
                      </select>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Quantidade:</span>
                        <Input
                          type="number"
                          min="1"
                          value={newQuantity}
                          onChange={e => setNewQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setAddingProduct(false);
                            setSelectedProductId('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="flex-1 gap-2"
                          onClick={handleAddProduct}
                          disabled={saving || !selectedProductId}
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stock List */}
              {stock.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum produto no stock</p>
                  <p className="text-sm text-muted-foreground">Adicione produtos ao seu carro</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stock.map(item => (
                    <motion.div
                      key={item.productId}
                      layout
                      className="bg-muted/30 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-background rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.productBrand} • {item.productVolume}
                          </p>
                        </div>

                        {editingId === item.productId ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditQuantity(Math.max(0, editQuantity - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={editQuantity}
                              onChange={e => setEditQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 h-8 text-center"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditQuantity(editQuantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleSaveEdit(item.productId)}
                              disabled={saving}
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3"
                              onClick={() => handleStartEdit(item)}
                            >
                              {item.quantity} un
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemove(item.productId)}
                              disabled={saving}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
