import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types';
import { useCart, BOTTLE_DEPOSIT_PRODUCT, BOTTLE_DEPOSIT_ID } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateUnitLabel, unitAbbrev } from '@/utils/productLabels';

interface ProductCardProps {
  product: Product;
  index: number;
}

// Remembers user's deposit choice per Ges20 product across re-renders/session.
// true  = user already owns the bottle (adds water item at 220 MT)
// false = user needs a bottle deposit (adds BOTTLE_DEPOSIT_PRODUCT at 1000 MT)
const depositChoiceMemory = new Map<string, boolean>();

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem, items, updateQuantity, removeItem, setItemQuantity } = useCart();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  // pendingQty: null = single-click "+1", number = manual input replacing total qty
  const [pendingQty, setPendingQty] = useState<number | null>(null);

  const cartItem = items.find(item => item.id === product.id);
  const depositItem = items.find(item => item.id === BOTTLE_DEPOSIT_ID);
  const isGes20 = product.brand === 'Natura / Ges20';
  // Quantity always tracks the water line; the deposit line mirrors it when needed.
  const remembered = depositChoiceMemory.get(product.id);
  const quantity = cartItem?.quantity || 0;

  // Sync deposit line to match water quantity when the user needs bottles.
  const syncDeposit = (waterQty: number, wantsDeposit: boolean) => {
    if (wantsDeposit) {
      if (waterQty <= 0) removeItem(BOTTLE_DEPOSIT_ID);
      else setItemQuantity(BOTTLE_DEPOSIT_PRODUCT, waterQty);
    } else {
      // Ensure no stray deposit line remains if user switched preference
      if (depositItem) removeItem(BOTTLE_DEPOSIT_ID);
    }
  };

  const applyChoice = (wantsDeposit: boolean, qty: number | null) => {
    const targetQty = qty != null ? qty : quantity + 1;
    setItemQuantity(product, targetQty);
    syncDeposit(targetQty, wantsDeposit);
  };

  const openDeposit = (qty: number | null) => {
    setPendingQty(qty);
    setDepositDialogOpen(true);
  };

  const handleAdd = () => {
    if (isGes20) {
      if (remembered !== undefined) {
        applyChoice(remembered, null);
        return;
      }
      openDeposit(null);
      return;
    }
    if (quantity === 0) addItem(product);
    else updateQuantity(product.id, quantity + 1);
  };

  const handleRemove = () => {
    if (isGes20 && remembered !== undefined) {
      const next = quantity - 1;
      if (next > 0) {
        setItemQuantity(product, next);
        syncDeposit(next, remembered);
      } else if (quantity === 1) {
        removeItem(product.id);
        syncDeposit(0, remembered);
      }
      return;
    }
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else if (quantity > 0) {
      removeItem(product.id);
    }
  };

  const handleQuantityChange = (value: string) => {
    if (value === '') return;
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    if (isGes20) {
      if (remembered !== undefined) {
        applyChoice(remembered, numValue);
        return;
      }
      openDeposit(numValue);
      return;
    }
    if (quantity === 0) {
      addItem(product, numValue);
    } else {
      setItemQuantity(product, numValue);
    }
  };

  // Resolve dialog choice:
  // wantsDeposit=false → adds N water bottles (220 MT each)
  // wantsDeposit=true  → adds N water bottles + N deposit slots (220 + 1000 MT each)
  const confirmChoice = (wantsDeposit: boolean) => {
    depositChoiceMemory.set(product.id, wantsDeposit);
    applyChoice(wantsDeposit, pendingQty);
    setDepositDialogOpen(false);
    setPendingQty(null);
  };

  const packPrice = product.price * product.minQuantity;

  return (
    <>
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
          {translateUnitLabel(product.name, language)}
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{product.volume}</p>
        <p className="text-[9px] sm:text-[10px] text-accent font-medium">
          {translateUnitLabel(product.unitLabel, language)}
        </p>
      </div>
      
      <div className="mt-2 sm:mt-3 pt-2 border-t border-border/50 space-y-1.5 sm:space-y-2">
        <p className="text-sm sm:text-base font-bold text-primary">
          {packPrice} <span className="text-[9px] sm:text-[10px] font-normal text-muted-foreground">MT/{unitAbbrev(product.unitLabel, product.minQuantity, language)}</span>
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

    <Dialog open={depositDialogOpen} onOpenChange={(o) => { setDepositDialogOpen(o); if (!o) setPendingQty(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Garrafão Natura / Ges20</DialogTitle>
          <DialogDescription>
            {pendingQty != null
              ? `Vai registar ${pendingQty} unidade(s). Já possui o garrafão para troca? Caso contrário, registaremos ${pendingQty} caução(ões) de 1.000 MT (reembolsáveis na devolução).`
              : 'Já possui o garrafão para troca? Caso contrário, será adicionada uma caução de 1.000 MT por garrafão (reembolsável na devolução).'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => confirmChoice(false)}>
            Já tenho o garrafão (+{(pendingQty ?? 1) * 220} MT)
          </Button>
          <Button onClick={() => confirmChoice(true)}>
            Preciso de garrafão (+{(pendingQty ?? 1) * 1220} MT)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
