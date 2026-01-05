import { motion } from 'framer-motion';
import { Package, ChefHat, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { OrderStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderTrackerProps {
  status: OrderStatus;
}

const statusOrder: OrderStatus[] = ['received', 'preparing', 'on_the_way', 'almost_there', 'delivered'];

export function OrderTracker({ status }: OrderTrackerProps) {
  const { t } = useLanguage();
  const currentIndex = statusOrder.indexOf(status);

  const steps = [
    { status: 'received', label: t.tracking.orderReceived, icon: Package },
    { status: 'preparing', label: t.tracking.inPreparation, icon: ChefHat },
    { status: 'on_the_way', label: t.tracking.onTheWay, icon: Truck },
    { status: 'almost_there', label: t.tracking.almostThere, icon: MapPin },
    { status: 'delivered', label: t.tracking.deliveredStatus, icon: CheckCircle2 },
  ];

  return (
    <div className="relative py-4">
      {/* Progress Line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />
      <motion.div
        className="absolute left-6 top-8 w-0.5 bg-accent origin-top"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: currentIndex / (steps.length - 1) }}
        style={{ height: `calc(100% - 4rem)` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <motion.div
              key={step.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center gap-4"
            >
              <motion.div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
              >
                <Icon className="w-5 h-5" />
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-accent"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-accent"
                  >
                    {t.tracking.inProgress}
                  </motion.p>
                )}
              </div>

              {isCompleted && !isCurrent && (
                <CheckCircle2 className="w-5 h-5 text-sam-success" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
