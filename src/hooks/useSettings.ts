import { useState, useEffect } from 'react';

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
  theme: 'light',
  language: 'pt',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateNotification = (key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  return { settings, updateSettings, updateNotification };
}
