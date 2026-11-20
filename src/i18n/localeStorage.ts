export type Locale = 'zh' | 'en';

export const LOCALE_STORAGE_KEY = 'remy_martin_ai_showcase_locale';

export function getStoredLocale(): Locale {
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw === 'en' || raw === 'zh') {
      return raw;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'zh';
}

export function saveStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage access errors
  }
}
