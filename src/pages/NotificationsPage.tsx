import { motion } from 'framer-motion';
import { Bell, Package, Truck, Tag, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'promo';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications - in a real app these would come from the database
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Pedido confirmado',
    message: 'O seu pedido #1234 foi confirmado e está a ser preparado.',
    time: '5 min',
    read: false,
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Entregador a caminho',
    message: 'O seu pedido está a caminho! Chegada prevista em 15 minutos.',
    time: '30 min',
    read: false,
  },
  {
    id: '3',
    type: 'promo',
    title: 'Promoção especial',
    message: 'Aproveite 20% de desconto em todos os garrafões de 20L!',
    time: '2h',
    read: true,
  },
  {
    id: '4',
    type: 'order',
    title: 'Pedido entregue',
    message: 'O seu pedido #1233 foi entregue com sucesso. Obrigado!',
    time: '1d',
    read: true,
  },
];

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return Package;
    case 'delivery':
      return Truck;
    case 'promo':
      return Tag;
    default:
      return Bell;
  }
};

const getIconColor = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return 'bg-blue-500/10 text-blue-500';
    case 'delivery':
      return 'bg-green-500/10 text-green-500';
    case 'promo':
      return 'bg-orange-500/10 text-orange-500';
    default:
      return 'bg-primary/10 text-primary';
  }
};

export default function NotificationsPage() {
  const { language } = useLanguage();
  
  const translations = {
    pt: {
      title: 'Notificações',
      empty: 'Sem notificações',
      emptyMessage: 'Você será notificado sobre pedidos e promoções aqui.',
      markAllRead: 'Marcar todas como lidas',
    },
    en: {
      title: 'Notifications',
      empty: 'No notifications',
      emptyMessage: 'You will be notified about orders and promotions here.',
      markAllRead: 'Mark all as read',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t.title} showBack />

      <div className="px-4 py-4">
        {mockNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{t.empty}</h2>
            <p className="text-muted-foreground text-center">{t.emptyMessage}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {mockNotifications.map((notification, index) => {
              const Icon = getIcon(notification.type);
              const iconColorClass = getIconColor(notification.type);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`sam-card p-4 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {notification.read && (
                      <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
