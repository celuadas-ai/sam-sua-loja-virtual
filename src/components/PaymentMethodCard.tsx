import { motion } from 'framer-motion';
import { Check, Smartphone, CreditCard, Banknote } from 'lucide-react';
import { PaymentMethod } from '@/types';
import mpesaLogo from '@/assets/mpesa-logo.png';
import emolaLogo from '@/assets/emola-logo.png';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const icons: Record<PaymentMethod, typeof Smartphone> = {
  mpesa: Smartphone,
  emola: Smartphone,
  pos: CreditCard,
  cash: Banknote
};

const colors: Record<PaymentMethod, string> = {
  mpesa: 'from-red-500 to-red-600',
  emola: 'from-orange-500 to-orange-600',
  pos: 'from-blue-500 to-blue-600',
  cash: 'from-green-500 to-green-600'
};

export function PaymentMethodCard({
  method,
  label,
  description,
  selected,
  onSelect
}: PaymentMethodCardProps) {
  const Icon = icons[method];

  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`w-full sam-card p-4 flex items-center gap-4 transition-all ${
      selected ?
      'ring-2 ring-accent border-accent' :
      'hover:border-accent/50'}`
      }>

      {method === 'mpesa' ?
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border bg-primary-foreground border-[#fa0000]">
          <img src={mpesaLogo} alt="M-Pesa" className="w-9 h-9 object-contain" />
        </div> :
      method === 'emola' ?
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border bg-primary-foreground border-orange-500">
          <img src={emolaLogo} alt="e-Mola" className="w-9 h-9 object-contain" />
        </div> :
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[method]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      }

      <div className="flex-1 text-left">
        <h3 className="font-semibold text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ?
        'border-accent bg-accent' :
        'border-border'}`
        }>

        {selected && <Check className="w-4 h-4 text-accent-foreground" />}
      </div>
    </motion.button>);

}