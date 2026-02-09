import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, Loader2, Navigation, Search, Crosshair } from 'lucide-react';
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

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  max_delivery_radius_km: number;
  is_active: boolean;
}

const MAPUTO_CENTER = { lat: -25.9692, lng: 32.5732 };

const defaultForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  max_delivery_radius_km: '15',
  is_active: true,
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
    };

    if (editingStore) {
      const { error } = await supabase
        .from('stores')
        .update(payload)
        .eq('id', editingStore.id);

      if (error) {
        toast.error('Erro ao atualizar loja');
      } else {
        toast.success('Loja atualizada');
      }
    } else {
      const { error } = await supabase
        .from('stores')
        .insert(payload);

      if (error) {
        toast.error('Erro ao criar loja');
      } else {
        toast.success('Loja criada');
      }
    }

    setSaving(false);
    setIsDialogOpen(false);
    fetchStores();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao eliminar loja');
    } else {
      toast.success('Loja eliminada');
      fetchStores();
    }
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

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-4">
                <span className="text-sm text-foreground font-medium">Raio máximo</span>
                <span className="text-sm font-bold text-primary">{store.max_delivery_radius_km} km</span>
              </div>

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

            {/* Interactive Map */}
            <StoreMapPicker
              latitude={form.latitude ? parseFloat(form.latitude) : undefined}
              longitude={form.longitude ? parseFloat(form.longitude) : undefined}
              radiusKm={parseFloat(form.max_delivery_radius_km) || 15}
              onLocationChange={(lat, lng, address) => {
                setForm(f => ({ ...f, latitude: lat.toString(), longitude: lng.toString(), address: address || f.address }));
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

// ── Inline Map Picker Component ──────────────────────────────────

interface StoreMapPickerProps {
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

function StoreMapPicker({ latitude, longitude, radiusKm, onLocationChange }: StoreMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const center = latitude && longitude ? { lat: latitude, lng: longitude } : MAPUTO_CENTER;

  // Load Google Maps
  useEffect(() => {
    const load = async () => {
      if (window.google?.maps?.places) { setIsLoaded(true); return; }
      const existing = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existing) {
        const iv = setInterval(() => { if (window.google?.maps?.places) { clearInterval(iv); setIsLoaded(true); } }, 100);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        if (error || !data?.apiKey) { setLoadError(true); return; }
        const s = document.createElement('script');
        s.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        s.async = true; s.defer = true;
        s.onload = () => setIsLoaded(true);
        s.onerror = () => setLoadError(true);
        document.head.appendChild(s);
      } catch { setLoadError(true); }
    };
    load();
  }, []);

  // Init map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center, zoom: 13, disableDefaultUI: true, zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });

    markerRef.current = new google.maps.Marker({
      position: center, map: mapInstance.current, draggable: true,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
    });

    circleRef.current = new google.maps.Circle({
      map: mapInstance.current, center, radius: radiusKm * 1000,
      fillColor: '#3b82f6', fillOpacity: 0.08, strokeColor: '#3b82f6', strokeOpacity: 0.4, strokeWeight: 2,
    });

    markerRef.current.addListener('dragend', () => {
      const pos = markerRef.current?.getPosition();
      if (pos) {
        const c = { lat: pos.lat(), lng: pos.lng() };
        circleRef.current?.setCenter(c);
        reverseGeocode(c);
      }
    });

    mapInstance.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const c = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        markerRef.current?.setPosition(c);
        circleRef.current?.setCenter(c);
        reverseGeocode(c);
      }
    });

    if (searchRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(searchRef.current, {
        componentRestrictions: { country: 'mz' }, fields: ['formatted_address', 'geometry'],
      });
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const c = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
          mapInstance.current?.panTo(c);
          mapInstance.current?.setZoom(15);
          markerRef.current?.setPosition(c);
          circleRef.current?.setCenter(c);
          onLocationChange(c.lat, c.lng, place.formatted_address);
        }
      });
    }
  }, [isLoaded, loadError]);

  // Update circle radius when slider changes
  useEffect(() => {
    circleRef.current?.setRadius(radiusKm * 1000);
  }, [radiusKm]);

  const reverseGeocode = useCallback((coords: { lat: number; lng: number }) => {
    if (!window.google?.maps) return;
    new google.maps.Geocoder().geocode({ location: coords }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        onLocationChange(coords.lat, coords.lng, results[0].formatted_address);
      } else {
        onLocationChange(coords.lat, coords.lng);
      }
    });
  }, [onLocationChange]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapInstance.current?.panTo(c);
        markerRef.current?.setPosition(c);
        circleRef.current?.setCenter(c);
        reverseGeocode(c);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  if (loadError) {
    return <div className="h-48 bg-muted rounded-xl flex items-center justify-center text-sm text-muted-foreground">Mapa indisponível</div>;
  }

  if (!isLoaded) {
    return (
      <div className="h-48 bg-muted rounded-xl flex items-center justify-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <Navigation className="w-6 h-6 text-primary-foreground" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Localização no mapa</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          ref={searchRef}
          placeholder="Pesquisar localização..."
          className="w-full pl-10 pr-10 h-9 rounded-md border border-input bg-background text-sm"
        />
        <button onClick={getCurrentLocation} disabled={isLocating} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted z-10">
          <Crosshair className={`w-4 h-4 text-primary ${isLocating ? 'animate-pulse' : ''}`} />
        </button>
      </div>
      <div className="relative h-64 rounded-xl overflow-hidden border border-border">
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-muted-foreground text-center">
          Clique no mapa ou arraste o marcador · Círculo azul = raio de entrega
        </div>
      </div>
    </div>
  );
}
