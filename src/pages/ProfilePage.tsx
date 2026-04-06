import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  nuit: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: user?.email || '',
    phone: '',
    nuit: '',
  });

  const [formData, setFormData] = useState<UserProfile>(profile);

  // Fetch profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, phone, nuit')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        setProfile({
          name: data?.name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: data?.phone || user.user_metadata?.phone || '',
          nuit: data?.nuit || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Update formData when profile changes
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const menuItems = [
    { icon: MapPin, label: t.profile.addresses, path: '/addresses' },
    { icon: CreditCard, label: t.profile.paymentMethods, path: '/payment-methods' },
    { icon: Settings, label: t.profile.settings, path: '/settings' },
    { icon: HelpCircle, label: t.profile.help, path: '/help' },
  ];

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.phone) {
      toast({ title: t.common.error, description: t.toasts.fillAllFields, variant: 'destructive' });
      return;
    }

    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          phone: formData.phone,
          nuit: formData.nuit,
        });

      if (error) {
        console.error('Error saving profile:', error);
        toast({ title: t.common.error, description: error.message, variant: 'destructive' });
        return;
      }

      setProfile({
        ...formData,
        email: user.email || '',
      });
      setIsEditOpen(false);
      toast({ title: t.toasts.profileUpdated });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: t.common.error, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: t.toasts.sessionEnded });
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24 sm:pb-20">
        <Header title={t.profile.title} />
        <div className="px-4 py-6 flex flex-col items-center justify-center gap-6 mt-12">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">Sem sessão iniciada</h2>
            <p className="text-muted-foreground text-sm">Inicie sessão para aceder ao seu perfil</p>
          </div>
          <Button onClick={() => navigate('/auth')} className="w-full max-w-xs">
            Iniciar Sessão
          </Button>
        </div>

        <div className="px-4 space-y-2 mt-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(item.path)}
                className="w-full sam-card p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-20">
      <Header title={t.profile.title} />

      {/* Profile Card */}
      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sam-card p-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {profile.name || 'Cliente'}
          </h2>
          <p className="text-muted-foreground">{profile.email}</p>
          <p className="text-sm text-muted-foreground">{profile.phone || '-'}</p>
          {profile.nuit && (
            <p className="text-xs text-muted-foreground mt-1">NUIT: {profile.nuit}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFormData(profile);
              setIsEditOpen(true);
            }}
            className="sam-button-secondary mt-4"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {t.profile.editProfile}
          </motion.button>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(item.path)}
              className="w-full sam-card p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">
                {item.label}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          );
        })}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: menuItems.length * 0.05 }}
          onClick={handleLogout}
          className="w-full sam-card p-4 flex items-center gap-4 border-destructive/20"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <span className="flex-1 text-left font-medium text-destructive">
            {t.profile.logout}
          </span>
        </motion.button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.editProfile}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.profile.fullName}
              </label>
              <Input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t.profile.fullName}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.profile.email}
              </label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O email não pode ser alterado
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t.profile.phone}
              </label>
              <Input
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+258 84 123 4567"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                NUIT
              </label>
              <Input
                value={formData.nuit}
                onChange={e => setFormData(prev => ({ ...prev, nuit: e.target.value }))}
                placeholder="Número de Identificação Tributária"
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving}>
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t.profile.saveChanges
            )}
          </Button>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
