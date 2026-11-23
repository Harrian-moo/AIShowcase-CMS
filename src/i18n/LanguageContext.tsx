import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../types/api';
import { getStoredLocale, Locale, saveStoredLocale } from './localeStorage';
import { TRANSLATIONS, TranslationDictionary } from './translations';
import i18n from './i18n';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: TranslationDictionary;
  localizeError: (error: unknown, fallbackMessage: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    saveStoredLocale(next);
    void i18n.changeLanguage(next);
    setLocaleState(next);
  }, []);

  const t = locale === 'zh-CN' ? TRANSLATIONS['zh-CN'] : TRANSLATIONS.en;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.title = t.meta.pageTitle;
  }, [locale, t.meta.pageTitle]);

  const localizeError = useCallback(
    (error: unknown, fallbackMessage: string): string => {
      if (error instanceof ApiError) {
        if (error.code && t.errors[error.code]) {
          return t.errors[error.code];
        }
        // Outside Chinese mode, avoid leaking raw Chinese backend messages if no code matches.
        if (locale !== 'zh-CN' && /[\u4e00-\u9fff]/.test(error.message)) {
          return fallbackMessage;
        }
        return error.message || fallbackMessage;
      }
      if (error instanceof Error && error.message) {
        if (locale !== 'zh-CN' && /[\u4e00-\u9fff]/.test(error.message)) {
          return fallbackMessage;
        }
        return error.message;
      }
      return fallbackMessage;
    },
    [locale, t.errors]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, localizeError }),
    [locale, setLocale, t, localizeError]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
