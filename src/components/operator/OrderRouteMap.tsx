import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderRouteMapProps {
  storeCoords: { lat: number; lng: number };
  customerCoords: { lat: number; lng: number };
  storeName: string;
}

export function OrderRouteMap({ storeCoords, customerCoords, storeName }: OrderRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkLoaded);
            setIsLoaded(true);
          }
        }, 100);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        if (error || !data?.apiKey) {
          setLoadError(true);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => setLoadError(true);
        document.head.appendChild(script);
      } catch {
        setLoadError(true);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize map and route
  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: {
        lat: (storeCoords.lat + customerCoords.lat) / 2,
        lng: (storeCoords.lng + customerCoords.lng) / 2,
      },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstanceRef.current = map;

    // Calculate and display route
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });
    directionsRendererRef.current = directionsRenderer;

    directionsService.route(
      {
        origin: storeCoords,
        destination: customerCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setRouteInfo({
              distance: leg.distance?.text || '',
              duration: leg.duration?.text || '',
            });
          }
        }
      }
    );
  }, [isLoaded, loadError, storeCoords, customerCoords]);

  if (loadError) {
    return (
      <div className="h-48 bg-muted rounded-xl flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Mapa indisponível</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-48 bg-muted rounded-xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative h-48 rounded-xl overflow-hidden border border-border">
        <div ref={mapRef} className="w-full h-full" />
      </div>
      {routeInfo && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{storeName} → Cliente</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{routeInfo.distance}</span>
            <span className="font-semibold text-primary">{routeInfo.duration}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
