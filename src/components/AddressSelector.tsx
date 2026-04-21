import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Check, ChevronRight, Map, Navigation, Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddressMapPicker } from './AddressMapPicker';
import { MapsHealthGuard } from './MapsHealthGuard';
import { supabase } from '@/integrations/supabase/client';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
  coords?: { lat: number; lng: number };
}

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
}

export function AddressSelector({ selectedAddress, onAddressSelect }: AddressSelectorProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('user-addresses');
    return saved ? JSON.parse(saved) : [
      { id: '1', label: 'Casa', address: 'Av. Eduardo Mondlane, 123, Maputo', isDefault: true },
      { id: '2', label: 'Trabalho', address: 'Rua da Zambézia, 45, Maputo', isDefault: false },
    ];
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState({ label: '', address: '', coords: null as { lat: number; lng: number } | null });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    localStorage.setItem('user-addresses', JSON.stringify(addresses));
  }, [addresses]);

  // Auto-select default address on mount
  useEffect(() => {
    if (!selectedAddress) {
      const defaultAddress = addresses.find(a => a.isDefault);
      if (defaultAddress) {
        onAddressSelect(defaultAddress);
      }
    }
  }, []);

  const handleSelectAddress = (address: Address) => {
    onAddressSelect(address);
    setIsOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddress?.id === id) {
      const remaining = addresses.filter(a => a.id !== id);
      const next = remaining.find(a => a.isDefault) || remaining[0] || null;
      if (next) onAddressSelect(next);
    }
    toast({ title: 'Endereço eliminado' });
  };

  const handleAddNew = () => {
    if (!formData.label || !formData.address) {
      toast({ title: t.toasts.fillAllFields, variant: 'destructive' });
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      label: formData.label,
      address: formData.address,
      isDefault: false,
      coords: formData.coords || undefined,
    };

    setAddresses(prev => [...prev, newAddress]);
    onAddressSelect(newAddress);
    setFormData({ label: '', address: '', coords: null });
    setShowNewForm(false);
    setShowMapPicker(false);
    setIsOpen(false);
    toast({ title: t.address.addressAdded });
  };

  const handleMapAddressSelect = (address: string, coords: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, address, coords }));
    setShowMapPicker(false);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocalização não suportada pelo navegador', variant: 'destructive' });
      return;
    }

    setIsLoadingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Get API key from edge function
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-maps-key');
      
      if (keyError || !keyData?.apiKey) {
        throw new Error('Não foi possível obter a chave da API');
      }

      // Reverse geocoding
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${keyData.apiKey}&language=pt`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        
        const currentLocationAddress: Address = {
          id: `current-${Date.now()}`,
          label: 'Localização Atual',
          address: address,
          isDefault: false,
          coords: { lat: latitude, lng: longitude },
        };

        // Add to addresses if not exists
        setAddresses(prev => {
          const filtered = prev.filter(a => !a.id.startsWith('current-'));
          return [...filtered, currentLocationAddress];
        });
        
        onAddressSelect(currentLocationAddress);
        setIsOpen(false);
        toast({ title: 'Localização atual detectada!' });
      } else {
        throw new Error('Não foi possível obter o endereço');
      }
    } catch (error: any) {
      console.error('Error getting location:', error);
      let message = 'Erro ao obter localização';
      if (error.code === 1) message = 'Permissão de localização negada';
      if (error.code === 2) message = 'Localização indisponível';
      if (error.code === 3) message = 'Tempo esgotado ao obter localização';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sam-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sam-light-blue flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t.address.deliverTo}</p>
            {selectedAddress ? (
              <>
                <p className="font-semibold text-foreground">{selectedAddress.label}</p>
                <p className="text-sm text-muted-foreground">{selectedAddress.address}</p>
              </>
            ) : (
              <p className="font-semibold text-primary">{t.address.selectAddress}</p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.address.selectDeliveryAddress}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Use Current Location - Primary Option */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleUseCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-accent to-accent/80 text-accent-foreground flex items-center gap-4 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                {isLoadingLocation ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Navigation className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-lg">
                  {isLoadingLocation ? 'A detectar...' : 'Usar localização atual'}
                </p>
                <p className="text-sm opacity-80">
                  Entrega rápida para onde você está agora
                </p>
              </div>
            </motion.button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground">ou escolha um endereço guardado</span>
              </div>
            </div>

            {addresses.map((address) => (
              <motion.div
                key={address.id}
                className={`p-4 rounded-xl border transition-all ${
                  selectedAddress?.id === address.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-1 flex items-start gap-3 cursor-pointer"
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      selectedAddress?.id === address.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {address.id.startsWith('current-') ? (
                        <Navigation className="w-5 h-5" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{address.label}</p>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {t.address.default}
                          </span>
                        )}
                        {address.coords && (
                          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                            GPS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{address.address}</p>
                    </div>
                    {selectedAddress?.id === address.id && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id);
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    title="Eliminar endereço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {!showNewForm ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNewForm(true)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 hover:border-primary/50 transition-colors"
              >
                <Plus className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">{t.address.addNewAddress}</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-border space-y-3"
              >
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {t.address.nameLabel}
                  </label>
                  <Input
                    value={formData.label}
                    onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Casa"
                  />
                </div>
                
                {showMapPicker ? (
                  <MapsHealthGuard>
                    <AddressMapPicker
                      initialAddress={formData.address}
                      onAddressSelect={handleMapAddressSelect}
                    />
                  </MapsHealthGuard>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      {t.address.fullAddress}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.address}
                        onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Av. Eduardo Mondlane, 123"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowMapPicker(true)}
                        title="Selecionar no mapa"
                      >
                        <Map className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowNewForm(false);
                      setShowMapPicker(false);
                      setFormData({ label: '', address: '', coords: null });
                    }}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button className="flex-1" onClick={handleAddNew}>
                    {t.common.add}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
