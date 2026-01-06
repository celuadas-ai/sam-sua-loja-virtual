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

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user-profile');
    if (saved) return JSON.parse(saved);
    return {
      name: user?.user_metadata?.full_name || 'Cliente',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '+258 84 000 0000',
    };
  });

  const [formData, setFormData] = useState<UserProfile>(profile);

  useEffect(() => {
    localStorage.setItem('user-profile', JSON.stringify(profile));
  }, [profile]);

  const menuItems = [
    { icon: MapPin, label: t.profile.addresses, path: '/addresses' },
    { icon: CreditCard, label: t.profile.paymentMethods, path: '/payment-methods' },
    { icon: Settings, label: t.profile.settings, path: '/settings' },
    { icon: HelpCircle, label: t.profile.help, path: '/help' },
  ];

  const handleSaveProfile = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({ title: t.common.error, description: t.toasts.fillAllFields, variant: 'destructive' });
      return;
    }
    setProfile(formData);
    setIsEditOpen(false);
    toast({ title: t.toasts.profileUpdated });
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user-profile');
    toast({ title: t.toasts.sessionEnded });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-20">
      <Header title={t.profile.title} showMenu />

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
            {profile.name}
          </h2>
          <p className="text-muted-foreground">{profile.email}</p>
          <p className="text-sm text-muted-foreground">{profile.phone}</p>

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
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
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
          </div>

          <Button onClick={handleSaveProfile} className="w-full">
            {t.profile.saveChanges}
          </Button>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
