import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AppSettings {
  notifications: {
    orders: boolean;
    promotions: boolean;
    delivery: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en';
}

const defaultSettings: AppSettings = {
  notifications: {
    orders: true,
    promotions: true,
    delivery: true,
  },
  theme: 'system',
  language: 'pt',
};

interface DbSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  notifications_orders: boolean;
  notifications_promotions: boolean;
  notifications_delivery: boolean;
}

function mapDbToSettings(db: DbSettings): AppSettings {
  return {
    theme: db.theme as AppSettings['theme'],
    language: db.language as AppSettings['language'],
    notifications: {
      orders: db.notifications_orders,
      promotions: db.notifications_promotions,
      delivery: db.notifications_delivery,
    },
  };
}

export function useSettingsDb() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Start with localStorage for immediate display
    const saved = localStorage.getItem('app-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const dbSettings = mapDbToSettings(data as DbSettings);
        setSettings(dbSettings);
        localStorage.setItem('app-settings', JSON.stringify(dbSettings));
      } else {
        // Create settings record if doesn't exist
        const localSettings = localStorage.getItem('app-settings');
        const initialSettings = localSettings ? JSON.parse(localSettings) : defaultSettings;
        
        await supabase.from('user_settings').insert({
          user_id: user.id,
          theme: initialSettings.theme,
          language: initialSettings.language,
          notifications_orders: initialSettings.notifications.orders,
          notifications_promotions: initialSettings.notifications.promotions,
          notifications_delivery: initialSettings.notifications.delivery,
        });
      }
      setIsSynced(true);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('app-settings', JSON.stringify(newSettings));

    if (user && isSynced) {
      try {
        await supabase
          .from('user_settings')
          .update({
            theme: newSettings.theme,
            language: newSettings.language,
            notifications_orders: newSettings.notifications.orders,
            notifications_promotions: newSettings.notifications.promotions,
            notifications_delivery: newSettings.notifications.delivery,
          })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error updating settings:', err);
      }
    }
  };

  const updateNotification = async (key: keyof AppSettings['notifications'], value: boolean) => {
    const newNotifications = { ...settings.notifications, [key]: value };
    await updateSettings({ notifications: newNotifications });
  };

  return { settings, isLoading, updateSettings, updateNotification };
}
