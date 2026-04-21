/**
 * Unified geolocation helper.
 * Works on web browsers and on Capacitor native (Android/iOS).
 * Provides detailed, user-friendly error messages.
 */

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
  // @ts-ignore
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

const isInsecureContext = (): boolean => {
  // Geolocation requires HTTPS (or localhost)
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
        // PositionError codes: 1=denied, 2=unavailable, 3=timeout
        if (err.code === 1) {
          // In iframes, permission errors often mean the parent didn't grant geolocation
          if (isInIframe()) {
            reject(new GeolocationError(
              'iframe_blocked',
              'O acesso à localização está bloqueado nesta pré-visualização. Abra a app em janela completa ou no telemóvel para usar a sua localização.'
            ));
          } else {
            reject(new GeolocationError(
              'permission_denied',
              'Permissão de localização negada. Active a localização nas definições do navegador.'
            ));
          }
        } else if (err.code === 2) {
          reject(new GeolocationError('unavailable', 'Localização indisponível. Verifique se o GPS está ativado.'));
        } else if (err.code === 3) {
          reject(new GeolocationError('timeout', 'Tempo esgotado ao obter a localização. Tente novamente.'));
        } else {
          reject(new GeolocationError('unknown', err.message || 'Erro ao obter localização.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Get the current device location.
 * Throws a `GeolocationError` with a user-friendly message on failure.
 *
 * IMPORTANT: Call this synchronously inside a user gesture handler
 * (button click). Do NOT await other async work before invoking this.
 */
export async function getCurrentLocation(): Promise<GeoCoords> {
  if (isCapacitorNative()) {
    try {
      // Dynamic import so web bundles don't break if plugin missing
      const { Geolocation } = await import('@capacitor/geolocation');

      // Ensure permissions
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
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
