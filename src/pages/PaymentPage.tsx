import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowRight, Lock, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
import { AddressSelector } from '@/components/AddressSelector';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useStores } from '@/hooks/useStores';
import { haversineDistance, isPointInPolygon } from '@/utils/distance';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
  coords?: { lat: number; lng: number };
}

interface UserProfile {
  name: string | null;
  phone: string | null;
  nuit: string | null;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { items, subtotal, iva, total, createOrder } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const hasAutoDetected = useRef(false);
  const { stores } = useStores();

  // Check if selected address is within delivery range
  const deliveryCheck = useMemo(() => {
    if (!selectedAddress?.coords || stores.length === 0) {
      return { withinRange: true, nearestStore: null, distance: null };
    }

    let nearestStore = stores[0];
    let minDist = Infinity;

    for (const store of stores) {
      const dist = haversineDistance(
        selectedAddress.coords.lat, selectedAddress.coords.lng,
        store.latitude, store.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearestStore = store;
      }
    }

    // Check polygon-based delivery zone first (if defined)
    let withinRange: boolean;
    if (nearestStore.deliveryZone && nearestStore.deliveryZone.length >= 3) {
      withinRange = isPointInPolygon(selectedAddress.coords, nearestStore.deliveryZone);
    } else {
      // Fallback to radius check
      withinRange = minDist <= nearestStore.maxDeliveryRadiusKm;
    }

    return {
      withinRange,
      nearestStore,
      distance: Math.round(minDist * 10) / 10,
    };
  }, [selectedAddress, stores]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('name, phone, nuit')
          .eq('id', user.id)
          .single();

        if (data) {
          setUserProfile({
            name: data.name || user.user_metadata?.full_name || null,
            phone: data.phone || user.user_metadata?.phone || null,
            nuit: data.nuit || null,
          });
        } else {
          setUserProfile({
            name: user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
            nuit: null,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setUserProfile({
          name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          nuit: null,
        });
      }
    };

    fetchProfile();
  }, [user]);

  // Auto-detect location on page load
  useEffect(() => {
    if (hasAutoDetected.current) return;
    hasAutoDetected.current = true;

    const autoDetectLocation = async () => {
      if (!navigator.geolocation) return;

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
          console.error('Failed to get API key');
          return;
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

          setSelectedAddress(currentLocationAddress);
          toast({ title: '📍 Localização detectada automaticamente!' });
        }
      } catch (error) {
        console.log('Auto-detect location skipped:', error);
        // Silent fail - user can still select manually
      }
    };

    autoDetectLocation();
  }, [toast]);

  const paymentMethods: {
    method: PaymentMethod;
    label: string;
    description: string;
  }[] = [
    { method: 'mpesa', label: 'M-Pesa', description: t.payment.payWithMpesa },
    { method: 'emola', label: 'e-Mola', description: t.payment.payWithEmola },
    { method: 'pos', label: 'POS', description: t.payment.cardOnDelivery },
    { method: 'cash', label: t.payment.cash, description: t.payment.payCash },
  ];

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: t.payment.selectAddress,
        variant: 'destructive',
      });
      return;
    }

    if (!deliveryCheck.withinRange) {
      toast({
        title: 'Fora da área de entrega',
        description: 'Infelizmente, a sua morada está fora da nossa área de entrega. Por favor, entre em contacto connosco através do +258 841234567 ou info@sam.co.mz para mais informações e para nos ajudar a melhorar o nosso serviço.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: t.payment.selectPaymentMethod,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order with customer details from profile and coordinates
      await createOrder(
        selectedMethod,
        userProfile?.name || undefined,
        userProfile?.phone || undefined,
        selectedAddress.address,
        selectedAddress.coords,
        userProfile?.nuit || undefined
      );

      toast({
        title: t.payment.orderConfirmed,
        description: t.payment.paymentOnDeliveryDesc,
      });

      navigate('/tracking');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Erro ao criar encomenda',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header title={t.payment.title} showBack />

      {/* Delivery Address Selector */}
      <div className="px-4 py-4">
        <AddressSelector
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
        />
      </div>

      {/* Distance warning */}
      {selectedAddress?.coords && !deliveryCheck.withinRange && (
        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
            <p className="text-sm font-semibold text-destructive">Fora da área de entrega</p>
              <p className="text-xs text-destructive/80 mt-1">
                Infelizmente, a sua morada está fora da nossa área de entrega. Por favor, entre em contacto connosco através do <strong>+258 841234567</strong> ou <strong>info@sam.co.mz</strong> para mais informações e para nos ajudar a melhorar o nosso serviço.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {selectedAddress?.coords && deliveryCheck.withinRange && deliveryCheck.distance !== null && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span className="w-2 h-2 rounded-full bg-sam-success" />
            Dentro da área de entrega — {deliveryCheck.distance} km de {deliveryCheck.nearestStore?.name}
          </div>
        </div>
      )}

      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sam-card p-4"
        >
          <h3 className="font-semibold text-foreground mb-3">{t.payment.orderSummary}</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-muted-foreground"
              >
                <span>
                  {item.quantity}x {item.name} ({item.volume})
                </span>
                <span>{(item.price * item.quantity * item.minQuantity).toFixed(2)} MT</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 pt-3 mt-3 border-t border-border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t.cart.subtotal}</span>
              <span>{subtotal.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IVA (16%)</span>
              <span>{iva.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
              <span>{t.cart.total}</span>
              <span>{total.toFixed(2)} MT</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Methods */}
      <div className="px-4">
        <h3 className="font-semibold text-foreground mb-3">
          {t.payment.paymentMethod}
        </h3>
        <div className="space-y-3">
          {paymentMethods.map((pm, index) => (
            <motion.div
              key={pm.method}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <PaymentMethodCard
                method={pm.method}
                label={pm.label}
                description={pm.description}
                selected={selectedMethod === pm.method}
                onSelect={() => setSelectedMethod(pm.method)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
          <Lock className="w-4 h-4" />
          <span>{t.payment.payOnDelivery}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirmOrder}
          disabled={!selectedMethod || isProcessing}
          className="sam-button-accent w-full py-4 rounded-2xl disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
              />
              <span>{t.payment.processing}</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>{t.payment.confirmOrder} - {total.toFixed(2)} MT</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
