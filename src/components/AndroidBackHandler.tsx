import { useEffect } from 'react';
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBackRoute } from '@/utils/navigation';

type BackButtonEvent = {
  canGoBack: boolean;
};

type NativeAppPlugin = {
  addListener(
    eventName: 'backButton',
    listenerFunc: (event: BackButtonEvent) => void,
  ): Promise<PluginListenerHandle>;
};

const NativeApp = registerPlugin<NativeAppPlugin>('App');

export default function AndroidBackHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;
    let listener: PluginListenerHandle | undefined;

    void NativeApp.addListener('backButton', () => {
      // On products page → exit app
      if (location.pathname === '/products') {
        (navigator as any).app?.exitApp?.();
        return;
      }

      // Use logical parent route
      const parentRoute = getBackRoute(location.pathname);
      if (parentRoute) {
        navigate(parentRoute, { replace: true });
        return;
      }

      // Fallback: go to products
      navigate('/products', { replace: true });
    }).then((handle) => {
      if (!isMounted) {
        void handle.remove();
        return;
      }

      listener = handle;
    });

    return () => {
      isMounted = false;

      if (listener) {
        void listener.remove();
      }
    };
  }, [location.pathname, navigate]);

  return null;
}
