import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit, User, Phone, Mail, MapPin } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  role?: string;
}

export default function AdminProfiles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // Fetch profiles
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({ title: 'Erro', description: 'Erro ao carregar perfis', variant: 'destructive' });
        return;
      }

      // Fetch user emails from auth.users via a separate query
      const userIds = profilesData?.map(p => p.id) || [];
      
      // Fetch roles for each user
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Create a map of user_id to role
      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);

      // Combine data
      const enrichedProfiles = profilesData?.map(profile => ({
        ...profile,
        role: rolesMap.get(profile.id) || 'customer',
      })) || [];

      setProfiles(enrichedProfiles);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar dados', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) =>
    (profile.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (profile.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile) return;
    
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('id', editingProfile.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        return;
      }

      toast({
        title: 'Perfil atualizado',
        description: `${formData.name || 'Perfil'} foi atualizado com sucesso`,
      });
      
      setIsEditOpen(false);
      setEditingProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro', description: 'Erro ao atualizar perfil', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/20 text-destructive';
      case 'operator':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'operator':
        return 'Operador';
      default:
        return 'Cliente';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout
      title="Perfis de Utilizadores"
      subtitle={`${profiles.length} utilizadores registados`}
    >
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome completo</Label>
              <Input 
                id="edit-name"
                placeholder="Nome completo" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input 
                id="edit-phone"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input 
                id="edit-address"
                placeholder="Endereço"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleUpdateProfile} disabled={isSaving}>
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum perfil encontrado</p>
        </div>
      ) : (
        /* Profiles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="sam-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {profile.name || 'Sem nome'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Desde {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)}`}>
                  {getRoleLabel(profile.role)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground truncate">{profile.address || '-'}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleEditClick(profile)}
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
