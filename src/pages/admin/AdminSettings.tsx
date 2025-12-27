import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface StoreSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    payments: boolean;
  };
}

const defaultSettings: StoreSettings = {
  name: 'SAM - Serviço de Água Móvel',
  phone: '+258 84 000 0000',
  email: 'contacto@sam.mz',
  address: 'Maputo, Moçambique',
  notifications: {
    newOrders: true,
    lowStock: true,
    payments: false,
  },
};

const settingsSections = [
  {
    icon: Store,
    title: 'Informações da Loja',
    description: 'Nome, endereço e contactos',
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Configurar alertas e avisos',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Palavras-passe e autenticação',
  },
  {
    icon: Palette,
    title: 'Aparência',
    description: 'Tema e personalização',
  },
  {
    icon: Globe,
    title: 'Idioma e Região',
    description: 'Formato de moeda e datas',
  },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('admin-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-settings');
    const savedSettings = saved ? JSON.parse(saved) : defaultSettings;
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(savedSettings));
  }, [settings]);

  const handleSave = () => {
    localStorage.setItem('admin-settings', JSON.stringify(settings));
    setHasChanges(false);
    toast({ title: 'Definições guardadas', description: 'As alterações foram guardadas com sucesso.' });
  };

  const handleNotificationToggle = (key: keyof StoreSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  return (
    <AdminLayout title="Definições" subtitle="Configurações do sistema">
      <div className="max-w-3xl space-y-6">
        {/* Store Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sam-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Informações da Loja</h2>
              <p className="text-sm text-muted-foreground">
                Dados básicos do negócio
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nome da Loja
              </label>
              <Input 
                value={settings.name}
                onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Telefone
              </label>
              <Input 
                value={settings.phone}
                onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email
              </label>
              <Input 
                value={settings.email}
                onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                type="email" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Endereço
              </label>
              <Input 
                value={settings.address}
                onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sam-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notificações</h2>
              <p className="text-sm text-muted-foreground">
                Gerir alertas do sistema
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">Novas encomendas</p>
                <p className="text-sm text-muted-foreground">
                  Receber alerta quando há nova encomenda
                </p>
              </div>
              <Switch 
                checked={settings.notifications.newOrders}
                onCheckedChange={() => handleNotificationToggle('newOrders')}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">Stock baixo</p>
                <p className="text-sm text-muted-foreground">
                  Alerta quando produtos estão em falta
                </p>
              </div>
              <Switch 
                checked={settings.notifications.lowStock}
                onCheckedChange={() => handleNotificationToggle('lowStock')}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">Pagamentos recebidos</p>
                <p className="text-sm text-muted-foreground">
                  Notificar sobre pagamentos confirmados
                </p>
              </div>
              <Switch 
                checked={settings.notifications.payments}
                onCheckedChange={() => handleNotificationToggle('payments')}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {settingsSections.slice(2).map((section, index) => (
            <motion.button
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => toast({ title: 'Em breve', description: `${section.title} estará disponível em breve.` })}
              className="sam-card p-6 text-left hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Save Button */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6"
          >
            <Button onClick={handleSave} size="lg" className="gap-2 shadow-lg">
              <Save className="w-5 h-5" />
              Guardar Alterações
            </Button>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
