import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface CartItemCardProps {
  item: CartItem;
  index: number;
}

export function CartItemCard({ item, index }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="sam-card p-4 flex items-center gap-4"
    >
      <div className="w-20 h-20 bg-sam-light-blue rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain p-2"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{item.brand}</p>
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        <p className="text-xs text-muted-foreground">{item.volume}</p>
        <p className="text-[10px] text-accent font-medium mb-1">{item.unitLabel}</p>
        <p className="font-bold text-primary">
          {item.price} <span className="text-xs font-normal text-muted-foreground">MT/un</span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => removeItem(item.id)}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>

        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          >
            <Minus className="w-4 h-4" />
          </motion.button>
          
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center hover:shadow-sam transition-colors"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        <p className="text-sm font-semibold text-foreground">
          {item.price * item.quantity} MT
        </p>
      </div>
    </motion.div>
  );
}
