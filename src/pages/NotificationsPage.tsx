import { motion } from 'framer-motion';
import { Bell, Package, Truck, Tag, Check, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const getNotificationIcon = (type: Notification['type']) => {
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

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return 'bg-blue-500/10 text-blue-500';
    case 'delivery':
      return 'bg-orange-500/10 text-orange-500';
    case 'promo':
      return 'bg-green-500/10 text-green-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Notificações" showBack />
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">A carregar notificações...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Notificações" showBack />

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="w-full gap-2"
          >
            <Check className="w-4 h-4" />
            Marcar todas como lidas ({unreadCount})
          </Button>
        </div>
      )}

      <div className="px-4 py-4 space-y-3">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sam-card p-8 text-center"
          >
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Sem notificações
            </h2>
            <p className="text-muted-foreground">
              As suas notificações aparecerão aqui quando houver atualizações nos seus pedidos.
            </p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
                className={`sam-card p-4 cursor-pointer transition-all ${
                  !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-semibold text-foreground ${!notification.isRead ? '' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                        locale: pt,
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
