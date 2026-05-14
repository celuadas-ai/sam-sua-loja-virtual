import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';

export interface GeoCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export class GeolocationError extends Error {
  code: 'unsupported' | 'permission_denied' | 'unavailable' | 'timeout' | 'insecure' | 'iframe_blocked' | 'unknown';

  constructor(code: GeolocationError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'GeolocationError';
  }
}

const isCapacitorNative = (): boolean => {
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

const isInsecureContext = (): boolean => {
  return typeof window !== 'undefined' && !window.isSecureContext;
};

const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const getWebPosition = (): Promise<GeoCoords> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError('unsupported', 'Este navegador não suporta geolocalização.'));
      return;
    }

    if (isInsecureContext()) {
      reject(new GeolocationError('insecure', 'Geolocalização requer uma ligação segura (HTTPS).'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        if (err.code === 1) {
          if (isInIframe()) {
            reject(new GeolocationError('iframe_blocked', 'O acesso à localização está bloqueado nesta pré-visualização. Abra a app em janela completa ou no telemóvel para usar a sua localização.'));
            return;
          }

          reject(new GeolocationError('permission_denied', 'Permissão de localização negada. Active a localização nas definições do navegador.'));
          return;
        }

        if (err.code === 2) {
          reject(new GeolocationError('unavailable', 'Localização indisponível. Verifique se o GPS está ativado.'));
          return;
        }

        if (err.code === 3) {
          reject(new GeolocationError('timeout', 'Tempo esgotado ao obter a localização. Tente novamente.'));
          return;
        }

        reject(new GeolocationError('unknown', err.message || 'Erro ao obter localização.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

export async function getCurrentLocation(): Promise<GeoCoords> {
  if (isCapacitorNative()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const permissions = await Geolocation.checkPermissions();

      if (permissions.location !== 'granted') {
        const requested = await Geolocation.requestPermissions();
        if (requested.location !== 'granted') {
          throw new GeolocationError('permission_denied', 'Permissão de localização negada nas definições do dispositivo.');
        }
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch (err: any) {
      if (err instanceof GeolocationError) throw err;
      throw new GeolocationError('unknown', err?.message || 'Erro ao obter localização no dispositivo.');
    }
  }

  return getWebPosition();
}

/**
 * Mensagem amigável e accionável a apresentar ao utilizador para cada tipo de erro.
 */
export function getLocationErrorMessage(error: unknown): { title: string; description: string } {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();

  if (error instanceof GeolocationError) {
    switch (error.code) {
      case 'permission_denied':
        return {
          title: 'Permissão de localização negada',
          description: isNative
            ? 'Active a localização em Definições > Aplicações > SAM Água > Permissões e tente novamente.'
            : 'Active a localização nas definições do navegador (ícone do cadeado junto ao endereço) e recarregue a página.',
        };
      case 'unavailable':
        return {
          title: 'Localização indisponível',
          description: 'Verifique se o GPS está ativado e se está num local com sinal.',
        };
      case 'timeout':
        return {
          title: 'Tempo esgotado',
          description: 'Não foi possível obter a sua localização a tempo. Tente novamente.',
        };
      case 'insecure':
        return {
          title: 'Ligação insegura',
          description: 'A geolocalização requer HTTPS. Abra a app numa ligação segura.',
        };
      case 'iframe_blocked':
        return {
          title: 'Pré-visualização bloqueia localização',
          description: 'Abra a app em janela completa ou no telemóvel para usar a sua localização.',
        };
      case 'unsupported':
        return {
          title: 'Geolocalização não suportada',
          description: 'O seu dispositivo ou navegador não suporta geolocalização.',
        };
      default:
        return { title: 'Erro de localização', description: error.message };
    }
  }

  return {
    title: 'Erro ao obter localização',
    description: (error as any)?.message || 'Tente novamente dentro de instantes.',
  };
}

/**
 * Fluxo único: pede permissão, obtém coordenadas e mostra toast claro em caso de falha.
 * Devolve `null` quando falha (já notificou o utilizador).
 */
export async function requestLocationWithFeedback(): Promise<GeoCoords | null> {
  try {
    return await getCurrentLocation();
  } catch (error) {
    const { title, description } = getLocationErrorMessage(error);
    sonnerToast.error(title, { description, duration: 6000 });
    console.warn('[geolocation] request failed:', error);
    return null;
  }
}

export async function getAddressFromCoordinates(
  coords: Pick<GeoCoords, 'latitude' | 'longitude'>,
  language = 'pt'
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('reverse-geocode', {
    body: {
      lat: coords.latitude,
      lng: coords.longitude,
      language,
    },
  });

  if (error) {
    throw new Error((data as { error?: string } | null)?.error || error.message || 'Não foi possível obter o endereço');
  }

  const address = (data as { address?: string } | null)?.address;
  if (!address) {
    throw new Error('Não foi possível obter o endereço');
  }

  return address;
}
