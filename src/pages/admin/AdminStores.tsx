import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StoreMapPicker from '@/components/admin/StoreMapPicker';

interface LatLng { lat: number; lng: number; }

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  max_delivery_radius_km: number;
  is_active: boolean;
  delivery_zone: LatLng[] | null;
}

const defaultForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  max_delivery_radius_km: '15',
  is_active: true,
  delivery_zone: null as LatLng[] | null,
};

export default function AdminStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStores(data.map(s => ({
        ...s,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        max_delivery_radius_km: Number(s.max_delivery_radius_km),
        delivery_zone: Array.isArray(s.delivery_zone) ? (s.delivery_zone as unknown as LatLng[]) : null,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchStores(); }, []);

  const openAdd = () => {
    setEditingStore(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (store: Store) => {
    setEditingStore(store);
    setForm({
      name: store.name,
      address: store.address,
      latitude: store.latitude.toString(),
      longitude: store.longitude.toString(),
      max_delivery_radius_km: store.max_delivery_radius_km.toString(),
      is_active: store.is_active,
      delivery_zone: store.delivery_zone,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.latitude || !form.longitude) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      address: form.address,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      max_delivery_radius_km: parseFloat(form.max_delivery_radius_km) || 15,
      is_active: form.is_active,
      delivery_zone: form.delivery_zone as unknown as import('@/integrations/supabase/types').Json,
    };

    if (editingStore) {
      const { error } = await supabase.from('stores').update(payload).eq('id', editingStore.id);
      if (error) toast.error('Erro ao atualizar loja');
      else toast.success('Loja atualizada');
    } else {
      const { error } = await supabase.from('stores').insert(payload);
      if (error) toast.error('Erro ao criar loja');
      else toast.success('Loja criada');
    }

    setSaving(false);
    setIsDialogOpen(false);
    fetchStores();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) toast.error('Erro ao eliminar loja');
    else { toast.success('Loja eliminada'); fetchStores(); }
  };

  return (
    <AdminLayout title="Lojas" subtitle="Gerir lojas e raio de entrega">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">{stores.length} loja(s) configurada(s)</p>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Loja
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : stores.length === 0 ? (
        <div className="sam-card p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma loja configurada</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Adicionar primeira loja
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="sam-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${store.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                    <MapPin className={`w-5 h-5 ${store.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{store.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${store.is_active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {store.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{store.address}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span>📍 {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-2">
                <span className="text-sm text-foreground font-medium">Raio máximo</span>
                <span className="text-sm font-bold text-primary">{store.max_delivery_radius_km} km</span>
              </div>

              {store.delivery_zone && store.delivery_zone.length >= 3 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 mb-4">
                  <span className="text-sm text-foreground font-medium">Zona de entrega</span>
                  <span className="text-sm font-bold text-amber-600">{store.delivery_zone.length} pontos</span>
                </div>
              )}

              {!(store.delivery_zone && store.delivery_zone.length >= 3) && <div className="mb-4" />}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(store)}>
                  <Edit className="w-3.5 h-3.5" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar loja?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação é irreversível. A loja "{store.name}" será removida permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(store.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStore ? 'Editar Loja' : 'Nova Loja'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: SAM Maputo Central" />
            </div>

            <StoreMapPicker
              latitude={form.latitude ? parseFloat(form.latitude) : undefined}
              longitude={form.longitude ? parseFloat(form.longitude) : undefined}
              radiusKm={parseFloat(form.max_delivery_radius_km) || 15}
              deliveryZone={form.delivery_zone ?? undefined}
              onLocationChange={(lat, lng, address) => {
                setForm(f => ({ ...f, latitude: lat.toString(), longitude: lng.toString(), address: address || f.address }));
              }}
              onDeliveryZoneChange={(zone) => {
                setForm(f => ({ ...f, delivery_zone: zone }));
              }}
            />

            <div>
              <Label>Endereço</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Ex: Av. 25 de Setembro, Maputo" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude</Label>
                <Input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="-25.9692" className="text-xs" />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="32.5732" className="text-xs" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Raio máximo de entrega</Label>
                <span className="text-sm font-bold text-primary">{form.max_delivery_radius_km} km</span>
              </div>
              <Slider
                value={[parseFloat(form.max_delivery_radius_km) || 15]}
                onValueChange={([v]) => setForm(f => ({ ...f, max_delivery_radius_km: v.toString() }))}
                min={1}
                max={50}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground mt-1">Pedidos fora deste raio serão bloqueados no checkout</p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Loja ativa</Label>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingStore ? 'Guardar Alterações' : 'Criar Loja'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
