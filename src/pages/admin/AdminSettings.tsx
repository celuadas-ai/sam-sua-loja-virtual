import { motion } from 'framer-motion';
import { Store, Bell, Shield, Palette, Globe } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

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
              <Input defaultValue="SAM - Serviço de Água Móvel" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Telefone
              </label>
              <Input defaultValue="+258 84 000 0000" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email
              </label>
              <Input defaultValue="contacto@sam.mz" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Endereço
              </label>
              <Input defaultValue="Maputo, Moçambique" />
            </div>
          </div>

          <Button className="mt-6">Guardar Alterações</Button>
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
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">Stock baixo</p>
                <p className="text-sm text-muted-foreground">
                  Alerta quando produtos estão em falta
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">Pagamentos recebidos</p>
                <p className="text-sm text-muted-foreground">
                  Notificar sobre pagamentos confirmados
                </p>
              </div>
              <Switch />
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
      </div>
    </AdminLayout>
  );
}
