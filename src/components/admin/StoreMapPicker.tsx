import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Search, Crosshair, Pencil, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const MAPUTO_CENTER = { lat: -25.9692, lng: 32.5732 };

interface LatLng {
  lat: number;
  lng: number;
}

interface StoreMapPickerProps {
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  deliveryZone?: LatLng[];
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  onDeliveryZoneChange: (zone: LatLng[] | null) => void;
}

export default function StoreMapPicker({
  latitude,
  longitude,
  radiusKm,
  deliveryZone,
  onLocationChange,
  onDeliveryZoneChange,
}: StoreMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const polygonMarkersRef = useRef<google.maps.Marker[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const drawingPointsRef = useRef<LatLng[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPointCount, setDrawingPointCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const reverseGeocode = useCallback((coords: LatLng) => {
    if (!window.google?.maps) return;
    new google.maps.Geocoder().geocode({ location: coords }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        onLocationChange(coords.lat, coords.lng, results[0].formatted_address);
      } else {
        onLocationChange(coords.lat, coords.lng);
      }
    });
  }, [onLocationChange]);

  // Clear all polygon visuals
  const clearPolygonVisuals = useCallback(() => {
    polygonRef.current?.setMap(null);
    polygonRef.current = null;
    polygonMarkersRef.current.forEach(m => m.setMap(null));
    polygonMarkersRef.current = [];
  }, []);

  // Draw saved polygon on map with draggable vertices
  const drawPolygonOnMap = useCallback((points: LatLng[]) => {
    if (!mapInstance.current || points.length < 3) return;

    clearPolygonVisuals();

    polygonRef.current = new google.maps.Polygon({
      paths: points,
      map: mapInstance.current,
      fillColor: '#f59e0b',
      fillOpacity: 0.15,
      strokeColor: '#f59e0b',
      strokeOpacity: 0.7,
      strokeWeight: 2,
    });

    points.forEach((pt, idx) => {
      const marker = new google.maps.Marker({
        position: pt,
        map: mapInstance.current!,
        draggable: true,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        zIndex: 10,
      });

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const updated = [...points];
        updated[idx] = { lat: pos.lat(), lng: pos.lng() };
        drawPolygonOnMap(updated);
        onDeliveryZoneChange(updated);
      });

      polygonMarkersRef.current.push(marker);
    });
  }, [onDeliveryZoneChange, clearPolygonVisuals]);

  // Setup click listener based on drawing mode
  const setupClickListener = useCallback(() => {
    if (!mapInstance.current) return;

    // Remove old listener
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    if (isDrawing) {
      // Disable default right-click context menu on the map
      mapInstance.current.setOptions({ disableDoubleClickZoom: true });
      clickListenerRef.current = mapInstance.current.addListener('rightclick', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pt = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        drawingPointsRef.current = [...drawingPointsRef.current, pt];
        setDrawingPointCount(drawingPointsRef.current.length);

        // Add visual marker for the point
        const marker = new google.maps.Marker({
          position: pt,
          map: mapInstance.current!,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });
        polygonMarkersRef.current.push(marker);

        // Draw polygon preview if 3+ points
        if (drawingPointsRef.current.length >= 3) {
          polygonRef.current?.setMap(null);
          polygonRef.current = new google.maps.Polygon({
            paths: drawingPointsRef.current,
            map: mapInstance.current!,
            fillColor: '#f59e0b',
            fillOpacity: 0.15,
            strokeColor: '#f59e0b',
            strokeOpacity: 0.7,
            strokeWeight: 2,
          });
        }
      });
    } else {
      clickListenerRef.current = mapInstance.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const c = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          markerRef.current?.setPosition(c);
          circleRef.current?.setCenter(c);
          reverseGeocode(c);
        }
      });
    }
  }, [isDrawing, reverseGeocode]);

  // Init map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;
    if (mapInstance.current) return; // Don't reinitialize

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

    // Draw existing polygon if present
    if (deliveryZone && deliveryZone.length >= 3) {
      drawPolygonOnMap(deliveryZone);
    }

    // Setup initial click listener (non-drawing mode)
    setupClickListener();
  }, [isLoaded, loadError]);

  // Re-setup click listener when drawing mode changes
  useEffect(() => {
    setupClickListener();
  }, [isDrawing, setupClickListener]);

  // Update circle radius
  useEffect(() => {
    circleRef.current?.setRadius(radiusKm * 1000);
  }, [radiusKm]);

  // Resize map when fullscreen changes
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        google.maps.event.trigger(mapInstance.current!, 'resize');
      }, 300);
    }
  }, [isFullscreen]);

  const startDrawing = () => {
    clearPolygonVisuals();
    drawingPointsRef.current = [];
    setDrawingPointCount(0);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    const points = drawingPointsRef.current;
    if (points.length >= 3) {
      clearPolygonVisuals();
      drawPolygonOnMap(points);
      onDeliveryZoneChange(points);
    }
    drawingPointsRef.current = [];
    setDrawingPointCount(0);
  };

  const clearPolygon = () => {
    clearPolygonVisuals();
    drawingPointsRef.current = [];
    setDrawingPointCount(0);
    setIsDrawing(false);
    onDeliveryZoneChange(null);
  };

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

  const mapContainerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-background flex flex-col'
    : 'space-y-2';

  return (
    <div className={mapContainerClasses}>
      {/* Header bar */}
      <div className={isFullscreen ? 'p-3 space-y-2' : 'space-y-2'}>
        {!isFullscreen && <Label>Localização no mapa</Label>}
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

        {/* Polygon + fullscreen controls */}
        <div className="flex gap-2 flex-wrap">
          {isDrawing ? (
            <Button type="button" size="sm" variant="default" onClick={finishDrawing} disabled={drawingPointCount < 3}>
              Concluir polígono ({drawingPointCount} pontos)
            </Button>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={startDrawing} className="gap-1">
              <Pencil className="w-3.5 h-3.5" />
              Desenhar zona de entrega
            </Button>
          )}
          {(deliveryZone?.length || drawingPointCount > 0) && (
            <Button type="button" size="sm" variant="outline" onClick={clearPolygon} className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="w-3.5 h-3.5" />
              Limpar polígono
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(f => !f)}
            className="gap-1 ml-auto"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isFullscreen ? 'Sair' : 'Ecrã inteiro'}
          </Button>
        </div>
      </div>

      {/* Map */}
      <div 
        className={`relative rounded-xl overflow-hidden border border-border ${isFullscreen ? 'flex-1 m-3 mt-0' : 'h-64'}`}
        onPointerDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-muted-foreground text-center">
          {isDrawing
            ? 'Clique no mapa para adicionar pontos ao polígono (mín. 3)'
            : 'Clique no mapa ou arraste o marcador · Amarelo = zona de entrega'}
        </div>
      </div>
    </div>
  );
}
