import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getStoredLocale } from './localeStorage';

const resources = {
  'zh-CN': {
    translation: {
      language: {
        menuHeader: '切换界面语言',
        activeTag: '当前',
      },
    },
  },
  en: {
    translation: {
      language: {
        menuHeader: 'Switch language',
        activeTag: 'Current',
      },
    },
  },
  fr: {
    translation: {
      language: {
        menuHeader: 'Changer de langue',
        activeTag: 'Actuel',
      },
    },
  },
  ar: {
    translation: {
      language: {
        menuHeader: 'تغيير اللغة',
        activeTag: 'الحالية',
      },
    },
  },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLocale(),
  fallbackLng: 'en',
  supportedLngs: ['zh-CN', 'en', 'fr', 'ar'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
