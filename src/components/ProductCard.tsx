import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Inicie sessão para comprar',
        description: 'Precisa de ter uma conta para adicionar produtos ao carrinho.',
      });
      navigate('/auth');
      return true;
    }
    return false;
  };

  const handleAdd = () => {
    if (requireAuth()) return;
    if (quantity === 0) {
      addItem(product);
    } else {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else if (quantity > 0) {
      removeItem(product.id);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0) {
      removeItem(product.id);
    } else {
      if (quantity === 0) {
        addItem(product);
        if (numValue > 1) {
          updateQuantity(product.id, numValue);
        }
      } else {
        updateQuantity(product.id, numValue);
      }
    }
  };

  // Price per pack/box = unit price × minQuantity
  const packPrice = product.price * product.minQuantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="sam-card p-2 sm:p-3 flex flex-col"
    >
      <div className="relative aspect-square mb-2 bg-gradient-to-b from-sam-light-blue/50 to-background rounded-xl overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} ${product.volume}`}
          className="w-full h-full object-contain p-1 sm:p-2 transition-transform hover:scale-105"
        />
      </div>
      
      <div className="flex-1 space-y-0.5 sm:space-y-1">
        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wide truncate">
          {product.brand}
        </p>
        <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{product.volume}</p>
        <p className="text-[9px] sm:text-[10px] text-accent font-medium">
          {product.unitLabel}
        </p>
      </div>
      
      <div className="mt-2 sm:mt-3 pt-2 border-t border-border/50 space-y-1.5 sm:space-y-2">
        <p className="text-sm sm:text-base font-bold text-primary">
          {packPrice} <span className="text-[9px] sm:text-[10px] font-normal text-muted-foreground">MT/{product.minQuantity > 1 ? product.unitLabel.toLowerCase().includes('caixa') ? 'cx' : 'pack' : 'un'}</span>
        </p>
        
        <div className="flex items-center gap-0.5 sm:gap-1">
          <motion.button
            onClick={handleRemove}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition-colors flex-shrink-0"
            disabled={quantity === 0}
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
          
          <Input
            type="number"
            value={quantity || ''}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0"
            className="h-7 sm:h-8 w-full text-center text-xs sm:text-sm font-medium px-0.5 sm:px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={0}
          />
          
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground hover:shadow-sam-glow transition-all flex-shrink-0"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
