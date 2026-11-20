import React, { createContext, useContext, useEffect, useState } from 'react';
import { ShowcaseDevice } from '../types/cms';

export type Locale = 'zh' | 'en';

const LOCALE_STORAGE_KEY = 'remy_cms_locale_v1';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  getDeviceDisplayName: (device: Pick<ShowcaseDevice, 'id' | 'name'>) => string;
  getDeviceDisplayLocation: (
    device: Pick<ShowcaseDevice, 'id' | 'location'>
  ) => string;
  getStoreDisplayName: (storeName?: string) => string;
}

const DEFAULT_DEVICE_EN_MAP: Record<
  string,
  { name: string; location: string }
> = {
  'RM-SH-001': {
    name: 'Main Entrance Showcase',
    location: "Shanghai Jing'an Flagship · 1F Main Island",
  },
  'RM-SH-002': {
    name: 'Private Tasting Lounge Showcase',
    location: "Shanghai Jing'an Flagship · 2F Tasting Suite",
  },
  'RM-SH-003': {
    name: 'Cocktail Bar Interactive Showcase',
    location: "Shanghai Jing'an Flagship · 1F Cocktail Bar",
  },
};

const DEFAULT_DEVICE_ZH_ORIGINAL_NAMES: Record<string, string> = {
  'RM-SH-001': '一楼主入口展示柜',
  'RM-SH-002': '二楼贵宾品鉴区展柜',
  'RM-SH-003': '鸡尾酒吧台互动展柜',
};

const DEFAULT_DEVICE_ZH_ORIGINAL_LOCATIONS: Record<string, string> = {
  'RM-SH-001': '上海静安旗舰店 · 一楼入口中岛',
  'RM-SH-002': '上海静安旗舰店 · 二楼贵宾品鉴室',
  'RM-SH-003': '上海静安旗舰店 · 一楼调制吧台区',
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'zh';
}

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage access errors
    }
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
  };

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  const getDeviceDisplayName = (
    device: Pick<ShowcaseDevice, 'id' | 'name'>
  ): string => {
    if (locale === 'en') {
      const defaultZh = DEFAULT_DEVICE_ZH_ORIGINAL_NAMES[device.id];
      const mapped = DEFAULT_DEVICE_EN_MAP[device.id];
      if (mapped && (!device.name || device.name === defaultZh)) {
        return mapped.name;
      }
    }
    return device.name;
  };

  const getDeviceDisplayLocation = (
    device: Pick<ShowcaseDevice, 'id' | 'location'>
  ): string => {
    if (locale === 'en') {
      const defaultZh = DEFAULT_DEVICE_ZH_ORIGINAL_LOCATIONS[device.id];
      const mapped = DEFAULT_DEVICE_EN_MAP[device.id];
      if (mapped && (!device.location || device.location === defaultZh)) {
        return mapped.location;
      }
    }
    return device.location;
  };

  const getStoreDisplayName = (storeName?: string): string => {
    if (locale === 'en') {
      if (!storeName || storeName.includes('上海静安') || storeName === '门店展示柜') {
        return "Shanghai Jing'an Flagship";
      }
      return storeName;
    }
    return storeName || '门店展示柜';
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        getDeviceDisplayName,
        getDeviceDisplayLocation,
        getStoreDisplayName,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx;
}
