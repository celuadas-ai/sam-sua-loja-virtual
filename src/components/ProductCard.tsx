import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  
  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    if (quantity === 0) {
      addItem(product);
    } else {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (quantity > product.minQuantity) {
      updateQuantity(product.id, quantity - 1);
    } else if (quantity > 0) {
      removeItem(product.id);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0) {
      removeItem(product.id);
    } else if (numValue >= product.minQuantity) {
      if (quantity === 0) {
        addItem(product);
        updateQuantity(product.id, numValue);
      } else {
        updateQuantity(product.id, numValue);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="sam-card p-3 flex flex-col"
    >
      <div className="relative aspect-square mb-2 bg-gradient-to-b from-sam-light-blue/50 to-background rounded-xl overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} ${product.volume}`}
          className="w-full h-full object-contain p-2 transition-transform hover:scale-105"
        />
      </div>
      
      <div className="flex-1 space-y-1">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          {product.brand}
        </p>
        <h3 className="font-semibold text-foreground text-sm leading-tight">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground">{product.volume}</p>
        <p className="text-[10px] text-accent font-medium">
          {product.unitLabel}
        </p>
      </div>
      
      <div className="mt-3 pt-2 border-t border-border/50 space-y-2">
        <p className="text-base font-bold text-primary">
          {product.price} <span className="text-[10px] font-normal text-muted-foreground">MT</span>
        </p>
        
        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleRemove}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            disabled={quantity === 0}
          >
            <Minus className="w-4 h-4" />
          </motion.button>
          
          <Input
            type="number"
            value={quantity || ''}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0"
            className="h-8 w-full text-center text-sm font-medium px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={0}
          />
          
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground hover:shadow-sam-glow transition-all"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
