import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Globe, ChevronRight, Smartphone } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const { settings, updateSettings, updateNotification } = useSettings();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    document.documentElement.classList.remove('light', 'dark');
    if (theme !== 'system') {
      document.documentElement.classList.add(theme);
    }
    toast({
      title: t.settings.themeUpdated,
      description: `${t.settings.themeChangedTo} ${theme === 'light' ? t.settings.light.toLowerCase() : theme === 'dark' ? t.settings.dark.toLowerCase() : t.settings.auto.toLowerCase()}`,
    });
  };

  const handleNotificationToggle = (key: keyof typeof settings.notifications) => {
    updateNotification(key, !settings.notifications[key]);
    toast({
      title: t.settings.notificationUpdated,
      description: settings.notifications[key] ? t.settings.notificationDisabled : t.settings.notificationEnabled,
    });
  };

  const handleLanguageChange = (lang: 'pt' | 'en') => {
    updateSettings({ language: lang });
    toast({ title: lang === 'pt' ? 'Idioma alterado para Português' : 'Language changed to English' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t.settings.title} showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Notificações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sam-card p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">{t.settings.notifications}</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">{t.settings.orderStatus}</p>
                <p className="text-sm text-muted-foreground">{t.settings.orderStatusDesc}</p>
              </div>
              <Switch
                checked={settings.notifications.orders}
                onCheckedChange={() => handleNotificationToggle('orders')}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">{t.settings.promotions}</p>
                <p className="text-sm text-muted-foreground">{t.settings.promotionsDesc}</p>
              </div>
              <Switch
                checked={settings.notifications.promotions}
                onCheckedChange={() => handleNotificationToggle('promotions')}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">{t.settings.delivery}</p>
                <p className="text-sm text-muted-foreground">{t.settings.deliveryDesc}</p>
              </div>
              <Switch
                checked={settings.notifications.delivery}
                onCheckedChange={() => handleNotificationToggle('delivery')}
              />
            </div>
          </div>
        </motion.div>

        {/* Aparência */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sam-card p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">{t.settings.appearance}</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-3 rounded-xl border-2 transition-all ${
                settings.theme === 'light'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-foreground" />
              <p className="text-sm font-medium text-foreground">{t.settings.light}</p>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-3 rounded-xl border-2 transition-all ${
                settings.theme === 'dark'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-foreground" />
              <p className="text-sm font-medium text-foreground">{t.settings.dark}</p>
            </button>

            <button
              onClick={() => handleThemeChange('system')}
              className={`p-3 rounded-xl border-2 transition-all ${
                settings.theme === 'system'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Smartphone className="w-6 h-6 mx-auto mb-2 text-foreground" />
              <p className="text-sm font-medium text-foreground">{t.settings.auto}</p>
            </button>
          </div>
        </motion.div>

        {/* Idioma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sam-card p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">{t.settings.language}</h2>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleLanguageChange('pt')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                language === 'pt'
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-muted/50 border-2 border-transparent hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇲🇿</span>
                <span className="font-medium text-foreground">Português</span>
              </div>
              {language === 'pt' && (
                <ChevronRight className="w-5 h-5 text-primary" />
              )}
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                language === 'en'
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-muted/50 border-2 border-transparent hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <span className="font-medium text-foreground">English</span>
              </div>
              {language === 'en' && (
                <ChevronRight className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Versão */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-4"
        >
          <p className="text-sm text-muted-foreground">SAM - Serviço de Água Móvel</p>
          <p className="text-xs text-muted-foreground">{t.settings.version} 1.0.0</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
