import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="sam-card p-4 flex flex-col"
    >
      <div className="relative aspect-square mb-3 bg-gradient-to-b from-sam-light-blue to-background rounded-xl overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} ${product.volume}`}
          className="w-full h-full object-contain p-4 transition-transform hover:scale-105"
        />
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center"
          >
            {quantity}
          </motion.div>
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-medium mb-1">
          {product.brand}
        </p>
        <h3 className="font-semibold text-foreground text-sm mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{product.volume}</p>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <p className="text-lg font-bold text-primary">
          {product.price} <span className="text-xs font-normal text-muted-foreground">MT</span>
        </p>
        
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isAdded
              ? 'bg-sam-success text-accent-foreground'
              : 'bg-accent text-accent-foreground hover:shadow-sam-glow'
          }`}
        >
          {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </motion.button>
      </div>
    </motion.div>
  );
}
