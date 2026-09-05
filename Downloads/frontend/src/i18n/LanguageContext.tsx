import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { en } from './en';
import { ta } from './ta';
import { hi } from './hi';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: typeof en;
  getLocalizedField: <T extends Record<string, any>>(obj: T, fieldPrefix: string) => string;
  getLocalizedArray: <T extends Record<string, any>>(obj: T, fieldPrefix: string) => string[];
}

const translations: Record<SupportedLanguage, typeof en> = {
  en,
  ta,
  hi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'kalasetu_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && (saved === 'en' || saved === 'ta' || saved === 'hi')) {
        return saved;
      }
    } catch (e) {
      // localStorage error fallback
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to save language preference to localStorage');
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || en;

  const getLocalizedField = <T extends Record<string, any>>(obj: T, fieldPrefix: string): string => {
    if (!obj) return '';
    const localizedKey = `${fieldPrefix}_${language}`;
    if (obj[localizedKey] && typeof obj[localizedKey] === 'string' && obj[localizedKey].trim() !== '') {
      return obj[localizedKey];
    }
    // Fallbacks
    const fallbackEnKey = `${fieldPrefix}_en`;
    if (obj[fallbackEnKey] && typeof obj[fallbackEnKey] === 'string') {
      return obj[fallbackEnKey];
    }
    if (obj[fieldPrefix] && typeof obj[fieldPrefix] === 'string') {
      return obj[fieldPrefix];
    }
    return '';
  };

  const getLocalizedArray = <T extends Record<string, any>>(obj: T, fieldPrefix: string): string[] => {
    if (!obj) return [];
    const localizedKey = `${fieldPrefix}_${language}`;
    if (Array.isArray(obj[localizedKey]) && obj[localizedKey].length > 0) {
      return obj[localizedKey];
    }
    const fallbackEnKey = `${fieldPrefix}_en`;
    if (Array.isArray(obj[fallbackEnKey])) {
      return obj[fallbackEnKey];
    }
    if (Array.isArray(obj[fieldPrefix])) {
      return obj[fieldPrefix];
    }
    return [];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getLocalizedField,
        getLocalizedArray,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
