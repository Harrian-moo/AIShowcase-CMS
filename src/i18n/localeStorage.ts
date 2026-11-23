export type Locale = 'zh-CN' | 'en' | 'fr' | 'ar';

export const LOCALE_STORAGE_KEY = 'remy_martin_ai_showcase_locale';

export function getStoredLocale(): Locale {
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw === 'en' || raw === 'fr' || raw === 'ar' || raw === 'zh-CN') {
      return raw;
    }
    if (raw === 'zh') return 'zh-CN';
  } catch {
    // Ignore storage access errors
  }
  return 'zh-CN';
}

export function saveStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage access errors
  }
}
