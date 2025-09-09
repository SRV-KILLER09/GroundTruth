
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { translations, TranslationKey } from '@/lib/translations';

export type Language = 'en' | 'hi' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  }, [language]);

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
