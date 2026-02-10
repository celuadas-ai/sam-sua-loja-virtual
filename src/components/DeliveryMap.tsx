/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { OrderStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useDriverPosition } from '@/hooks/useDriverPosition';

interface DeliveryMapProps {
  status: OrderStatus;
  destinationAddress?: string;
  destinationCoords?: { lat: number; lng: number };
  orderId?: string;
}

const MAPUTO_CENTER = { lat: -25.9692, lng: 32.5732 };

export function DeliveryMap({ status, destinationAddress, destinationCoords, orderId }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Real-time driver position from Supabase
  const { position: realtimePosition } = useDriverPosition(orderId);

  // Use real destination coords or fallback to Maputo center
  const destination = destinationCoords || MAPUTO_CENTER;

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

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;

    const center = realtimePosition 
      ? { lat: realtimePosition.latitude, lng: realtimePosition.longitude }
      : destination;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });

    // Destination marker (customer location)
    destMarkerRef.current = new window.google.maps.Marker({
      position: destination,
      map: mapInstanceRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Destino',
    });

    // Driver marker (only shown when position is available)
    if (realtimePosition) {
      const driverPos = { lat: realtimePosition.latitude, lng: realtimePosition.longitude };
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverPos,
        map: mapInstanceRef.current,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="4"/>
              <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🛵</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        },
        title: 'Entregador',
      });

      // Draw route between driver and destination
      drawRoute(driverPos, destination);

      // Fit bounds to show both markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(driverPos);
      bounds.extend(destination);
      mapInstanceRef.current.fitBounds(bounds, 60);
    }
  }, [isLoaded, loadError]);

  // Update driver position in realtime
  useEffect(() => {
    if (!mapInstanceRef.current || !realtimePosition) return;

    const driverPos = { lat: realtimePosition.latitude, lng: realtimePosition.longitude };

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(driverPos);
    } else {
      // Create driver marker if it doesn't exist yet
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverPos,
        map: mapInstanceRef.current,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="4"/>
              <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🛵</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        },
        title: 'Entregador',
      });
    }

    // Update route
    drawRoute(driverPos, destination);

    // Pan to include both
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(driverPos);
    bounds.extend(destination);
    mapInstanceRef.current.fitBounds(bounds, 60);
  }, [realtimePosition]);

  const drawRoute = (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;

    if (!routeRendererRef.current) {
      routeRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination: dest,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, routeStatus) => {
        if (routeStatus === 'OK' && result) {
          routeRendererRef.current?.setDirections(result);
        }
      }
    );
  };

  if (loadError) {
    return (
      <div className="relative h-64 sm:h-72 bg-muted overflow-hidden flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Mapa indisponível</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative h-64 sm:h-72 bg-muted overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg"
          >
            <Navigation className="w-8 h-8 text-accent-foreground" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-64 sm:h-72 overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Status overlay */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2"
      >
        <span className="text-lg">
          {realtimePosition ? '🛵' : '📦'}
        </span>
        <span className="text-sm font-medium text-foreground">
          {status === 'on_the_way' && 'A caminho'}
          {status === 'almost_there' && 'Quase a chegar'}
          {status === 'delivered' && 'Entregue'}
          {status === 'preparing' && 'Em preparação'}
          {status === 'received' && 'Pedido recebido'}
        </span>
        {!realtimePosition && (status === 'on_the_way' || status === 'almost_there') && (
          <span className="text-xs text-muted-foreground">(aguardando GPS)</span>
        )}
      </motion.div>
    </div>
  );
}
