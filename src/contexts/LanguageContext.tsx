import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        return settings.language || 'pt';
      } catch {
        return 'pt';
      }
    }
    return 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Also update localStorage settings
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        settings.language = lang;
        localStorage.setItem('app-settings', JSON.stringify(settings));
      } catch {
        localStorage.setItem('app-settings', JSON.stringify({ language: lang }));
      }
    } else {
      localStorage.setItem('app-settings', JSON.stringify({ language: lang }));
    }
  };

  // Listen for storage changes (when settings change from SettingsPage)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('app-settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          if (settings.language && settings.language !== language) {
            setLanguageState(settings.language);
          }
        } catch {
          // ignore
        }
      }
    };

    // Check periodically for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(handleStorageChange, 500);
    return () => clearInterval(interval);
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
