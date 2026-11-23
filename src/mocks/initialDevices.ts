import { Locale } from '../i18n/localeStorage';
import { ProductSeries, ShowcaseDevice } from '../types/cms';
import { INITIAL_MOCK_SERIES } from './initialData';
import { INITIAL_MOCK_SERIES_EN } from './initialDataEn';

function cloneSeries(list: ProductSeries[]): ProductSeries[] {
  return JSON.parse(JSON.stringify(list)) as ProductSeries[];
}

const fullSeriesZh = cloneSeries(INITIAL_MOCK_SERIES);

const vipSeriesZh = cloneSeries(
  INITIAL_MOCK_SERIES.filter((s) => s.id === 'xo' || s.id === 'club')
).map((series) => {
  if (series.id === 'xo') {
    return {
      ...series,
      taglineZh: '私享典范',
      description:
        '专为人头马 VIP 品鉴空间甄选呈现。400种珍稀生命之水经岁月沉淀，释放深邃华美的花果与香料交响，适合私密慢品与高端收藏。',
    };
  }
  return series;
});

const barSeriesZh = cloneSeries(
  INITIAL_MOCK_SERIES.filter((s) => s.id === 'vsop' || s.id === '1738')
).map((series) => {
  if (series.id === 'vsop') {
    return {
      ...series,
      taglineZh: '鸡尾酒典范',
      description:
        '吧台特调灵感之源。香草、成熟杏桃与柔和甘草优雅交融，无论加冰纯饮或调制经典法式鸡尾酒，皆展现平衡顺滑的迷人层次。',
    };
  }
  return series;
});

export const INITIAL_MOCK_DEVICES: ShowcaseDevice[] = [
  {
    id: 'RM-SH-001',
    serialNumber: 'SN-AIS-20260101',
    name: '一楼主入口展示柜',
    location: '上海静安旗舰店 · 1F 主入口中岛',
    resolution: '2160 × 3840',
    connectionStatus: 'online',
    lastSyncedAt: '2026-11-18 18:30',
    series: fullSeriesZh,
    standbyConfig: {
      enabled: true,
      idleTimeoutSeconds: 60,
      historyRetentionDays: 5,
      ads: [
        {
          id: 'ad-sh001-club',
          seriesId: 'club',
          seriesName: 'CLUB',
          copyMode: 'with-copy',
          title: '多面风范 · 锐意绽放',
          subtitle: '八角切面酒樽凝萃优质香槟区生命之水，烤杏仁与肉桂辛香层叠交织',
          ctaText: '轻触屏幕 · 探索 CLUB 系列风味',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/club.png',
          durationSeconds: 8,
          status: 'active',
          sortOrder: 1,
          sourceHistoryId: 'hist-sh001-1',
          updatedAt: '2026-11-18 18:30',
        },
        {
          id: 'ad-sh001-xo',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'no-copy',
          title: '',
          subtitle: '',
          ctaText: '',
          visualStyle: 'luxury-studio',
          imageUrl: '/assets/remy/xo.png',
          durationSeconds: 10,
          status: 'active',
          sortOrder: 2,
          sourceHistoryId: 'hist-sh001-2',
          updatedAt: '2026-11-18 17:45',
        },
        {
          id: 'ad-sh001-1738',
          seriesId: '1738',
          seriesName: '1738',
          copyMode: 'with-copy',
          title: '皇家礼赞 · 重烘烤橡木醇韵',
          subtitle: '',
          ctaText: '轻触屏幕 · 了解 1738 传奇故事',
          visualStyle: 'festive-gifting',
          imageUrl: '/assets/remy/1738.png',
          durationSeconds: 8,
          status: 'paused',
          sortOrder: 3,
          updatedAt: '2026-11-17 20:10',
        },
      ],
      history: [
        {
          id: 'hist-sh001-1',
          seriesId: 'club',
          seriesName: 'CLUB',
          copyMode: 'with-copy',
          title: '多面风范 · 锐意绽放',
          subtitle: '八角切面酒樽凝萃优质香槟区生命之水，烤杏仁与肉桂辛香层叠交织',
          ctaText: '轻触屏幕 · 探索 CLUB 系列风味',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/club.png',
          createdAt: '2026-11-19 16:20',
          expiresAt: '2026-11-24 16:20',
          savedToCarousel: true,
          linkedAdId: 'ad-sh001-club',
        },
        {
          id: 'hist-sh001-2',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'no-copy',
          title: '',
          subtitle: '',
          ctaText: '',
          visualStyle: 'luxury-studio',
          imageUrl: '/assets/remy/xo.png',
          createdAt: '2026-11-19 11:05',
          expiresAt: '2026-11-24 11:05',
          savedToCarousel: true,
          linkedAdId: 'ad-sh001-xo',
        },
        {
          id: 'hist-sh001-3',
          seriesId: 'vsop',
          seriesName: 'VSOP',
          copyMode: 'with-copy',
          title: '经典和谐 · 琥珀流光',
          subtitle: '',
          ctaText: '',
          visualStyle: 'modern-french',
          imageUrl: '/assets/remy/vsop.png',
          createdAt: '2026-11-18 14:40',
          expiresAt: '2026-11-23 14:40',
          savedToCarousel: false,
        },
      ],
    },
  },
  {
    id: 'RM-SH-002',
    serialNumber: 'SN-AIS-20260102',
    name: '二楼 VIP 品鉴区展柜',
    location: '上海静安旗舰店 · 2F 贵宾品鉴室',
    resolution: '2160 × 3840',
    connectionStatus: 'online',
    lastSyncedAt: '2026-11-18 15:10',
    series: vipSeriesZh,
    standbyConfig: {
      enabled: true,
      idleTimeoutSeconds: 90,
      historyRetentionDays: 5,
      ads: [
        {
          id: 'ad-sh002-xo',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'with-copy',
          title: '私享典范 · 贵宾品鉴室甄选',
          subtitle: '慢品大香槟区与小香槟区陈年佳酿，感受丝绒般深邃余韵',
          ctaText: '轻触屏幕 · 开启私享品鉴之旅',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/xo.png',
          durationSeconds: 12,
          status: 'active',
          sortOrder: 1,
          sourceHistoryId: 'hist-sh002-1',
          updatedAt: '2026-11-18 15:10',
        },
      ],
      history: [
        {
          id: 'hist-sh002-1',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'with-copy',
          title: '私享典范 · 贵宾品鉴室甄选',
          subtitle: '慢品大香槟区与小香槟区陈年佳酿，感受丝绒般深邃余韵',
          ctaText: '轻触屏幕 · 开启私享品鉴之旅',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/xo.png',
          createdAt: '2026-11-18 15:08',
          expiresAt: '2026-11-23 15:08',
          savedToCarousel: true,
          linkedAdId: 'ad-sh002-xo',
        },
      ],
    },
  },
  {
    id: 'RM-SH-003',
    serialNumber: 'SN-AIS-20260103',
    name: '鸡尾酒吧台互动展柜',
    location: '上海静安旗舰店 · 1F 调制吧台区',
    resolution: '1920 × 1080',
    connectionStatus: 'offline',
    lastSyncedAt: '2026-11-17 22:05',
    series: barSeriesZh,
    standbyConfig: {
      enabled: true,
      idleTimeoutSeconds: 45,
      historyRetentionDays: 5,
      ads: [
        {
          id: 'ad-sh003-vsop',
          seriesId: 'vsop',
          seriesName: 'VSOP',
          copyMode: 'with-copy',
          title: '经典和谐 · 法式特调灵感',
          subtitle: '香草、成熟杏桃与柔和甘草优雅平衡，成就多变鸡尾酒体验',
          ctaText: '轻触屏幕 · 查看吧台特调建议',
          visualStyle: 'modern-french',
          imageUrl: '/assets/remy/vsop.png',
          durationSeconds: 8,
          status: 'active',
          sortOrder: 1,
          sourceHistoryId: 'hist-sh003-1',
          updatedAt: '2026-11-17 22:05',
        },
      ],
      history: [
        {
          id: 'hist-sh003-1',
          seriesId: 'vsop',
          seriesName: 'VSOP',
          copyMode: 'with-copy',
          title: '经典和谐 · 法式特调灵感',
          subtitle: '香草、成熟杏桃与柔和甘草优雅平衡，成就多变鸡尾酒体验',
          ctaText: '轻触屏幕 · 查看吧台特调建议',
          visualStyle: 'modern-french',
          imageUrl: '/assets/remy/vsop.png',
          createdAt: '2026-11-17 22:02',
          expiresAt: '2026-11-22 22:02',
          savedToCarousel: true,
          linkedAdId: 'ad-sh003-vsop',
        },
      ],
    },
  },
];

const fullSeriesEn = cloneSeries(INITIAL_MOCK_SERIES_EN);

const vipSeriesEn = cloneSeries(
  INITIAL_MOCK_SERIES_EN.filter((s) => s.id === 'xo' || s.id === 'club')
).map((series) => {
  if (series.id === 'xo') {
    return {
      ...series,
      taglineZh: 'PRIVATE LOUNGE',
      description:
        'Curated exclusively for the Rémy Martin VIP Tasting Lounge. Up to 400 rare eaux-de-vie mature into a deep floral and spice symphony tailored for private enjoyment and collecting.',
    };
  }
  return series;
});

const barSeriesEn = cloneSeries(
  INITIAL_MOCK_SERIES_EN.filter((s) => s.id === 'vsop' || s.id === '1738')
).map((series) => {
  if (series.id === 'vsop') {
    return {
      ...series,
      taglineZh: 'MIXOLOGY ICON',
      description:
        'The inspiration behind signature cognac mixology. Vanilla, ripe apricot, and soft licorice harmonize effortlessly over ice or within classic French cocktails.',
    };
  }
  return series;
});

export const INITIAL_MOCK_DEVICES_EN: ShowcaseDevice[] = [
  {
    id: 'RM-SH-001',
    serialNumber: 'SN-AIS-20260101',
    name: '1F Main Entrance Showcase',
    location: "Shanghai Jing'an Flagship · 1F Main Atrium",
    resolution: '2160 × 3840',
    connectionStatus: 'online',
    lastSyncedAt: '2026-11-18 18:30',
    series: fullSeriesEn,
    standbyConfig: {
      enabled: true,
      idleTimeoutSeconds: 60,
      historyRetentionDays: 5,
      ads: [
        {
          id: 'ad-sh001-club',
          seriesId: 'club',
          seriesName: 'CLUB',
          copyMode: 'with-copy',
          title: 'Multifaceted Boldness, Elevated',
          subtitle:
            'Iconic octagonal decanter uniting Fine Champagne eaux-de-vie with grilled almond and warm cinnamon.',
          ctaText: 'Touch screen to explore CLUB Collection',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/club.png',
          durationSeconds: 8,
          status: 'active',
          sortOrder: 1,
          sourceHistoryId: 'hist-sh001-1',
          updatedAt: '2026-11-18 18:30',
        },
        {
          id: 'ad-sh001-xo',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'no-copy',
          title: '',
          subtitle: '',
          ctaText: '',
          visualStyle: 'luxury-studio',
          imageUrl: '/assets/remy/xo.png',
          durationSeconds: 10,
          status: 'active',
          sortOrder: 2,
          sourceHistoryId: 'hist-sh001-2',
          updatedAt: '2026-11-18 17:45',
        },
        {
          id: 'ad-sh001-1738',
          seriesId: '1738',
          seriesName: '1738',
          copyMode: 'with-copy',
          title: 'Accord Royal · Toasted Oak Mastery',
          subtitle: '',
          ctaText: 'Touch screen to uncover 1738 heritage',
          visualStyle: 'festive-gifting',
          imageUrl: '/assets/remy/1738.png',
          durationSeconds: 8,
          status: 'paused',
          sortOrder: 3,
          updatedAt: '2026-11-17 20:10',
        },
      ],
      history: [
        {
          id: 'hist-sh001-1',
          seriesId: 'club',
          seriesName: 'CLUB',
          copyMode: 'with-copy',
          title: 'Multifaceted Boldness, Elevated',
          subtitle:
            'Iconic octagonal decanter uniting Fine Champagne eaux-de-vie with grilled almond and warm cinnamon.',
          ctaText: 'Touch screen to explore CLUB Collection',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/club.png',
          createdAt: '2026-11-19 16:20',
          expiresAt: '2026-11-24 16:20',
          savedToCarousel: true,
          linkedAdId: 'ad-sh001-club',
        },
        {
          id: 'hist-sh001-2',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'no-copy',
          title: '',
          subtitle: '',
          ctaText: '',
          visualStyle: 'luxury-studio',
          imageUrl: '/assets/remy/xo.png',
          createdAt: '2026-11-19 11:05',
          expiresAt: '2026-11-24 11:05',
          savedToCarousel: true,
          linkedAdId: 'ad-sh001-xo',
        },
        {
          id: 'hist-sh001-3',
          seriesId: 'vsop',
          seriesName: 'VSOP',
          copyMode: 'with-copy',
          title: 'Iconic Harmony · Amber Radiance',
          subtitle: '',
          ctaText: '',
          visualStyle: 'modern-french',
          imageUrl: '/assets/remy/vsop.png',
          createdAt: '2026-11-18 14:40',
          expiresAt: '2026-11-23 14:40',
          savedToCarousel: false,
        },
      ],
    },
  },
  {
    id: 'RM-SH-002',
    serialNumber: 'SN-AIS-20260102',
    name: '2F VIP Tasting Lounge Showcase',
    location: "Shanghai Jing'an Flagship · 2F Private Lounge",
    resolution: '2160 × 3840',
    connectionStatus: 'online',
    lastSyncedAt: '2026-11-18 15:10',
    series: vipSeriesEn,
    standbyConfig: {
      enabled: true,
      idleTimeoutSeconds: 90,
      historyRetentionDays: 5,
      ads: [
        {
          id: 'ad-sh002-xo',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'with-copy',
          title: 'Private Lounge Reserve Selection',
          subtitle:
            'Savor Grande and Petite Champagne aged excellence with an enduring velvety finish.',
          ctaText: 'Touch screen to begin private tasting',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/xo.png',
          durationSeconds: 12,
          status: 'active',
          sortOrder: 1,
          sourceHistoryId: 'hist-sh002-1',
          updatedAt: '2026-11-18 15:10',
        },
      ],
      history: [
        {
          id: 'hist-sh002-1',
          seriesId: 'xo',
          seriesName: 'XO',
          copyMode: 'with-copy',
          title: 'Private Lounge Reserve Selection',
          subtitle:
            'Savor Grande and Petite Champagne aged excellence with an enduring velvety finish.',
          ctaText: 'Touch screen to begin private tasting',
          visualStyle: 'nocturne-lounge',
          imageUrl: '/assets/remy/xo.png',
          createdAt: '2026-11-18 15:08',
          expiresAt: '2026-11-23 15:08',
          savedToCarousel: true,
          linkedAdId: 'ad-sh002-xo',
        },
      ],
    },
  },
  {
    id: 'RM-SH-003',
    serialNumber: 'SN-AIS-20260103',
    name: 'Cocktail Bar Interactive Showcase',
    location: "Shanghai Jing'an Flagship · 1F Mixology Bar",
    resolution: '1920 × 1080',
    connectionStatus: 'offline',
    lastSyncedAt: '2026-11-17 22:05',
    series: barSeriesEn,
    standbyConfig: {
      enabled: true,
      idleTimeoutSeconds: 45,
      historyRetentionDays: 5,
      ads: [
        {
          id: 'ad-sh003-vsop',
          seriesId: 'vsop',
          seriesName: 'VSOP',
          copyMode: 'with-copy',
          title: 'Iconic Harmony for Modern Mixology',
          subtitle:
            'Balanced vanilla, ripe apricot, and soft licorice designed for effortless signature serves.',
          ctaText: 'Touch screen to view cocktail rituals',
          visualStyle: 'modern-french',
          imageUrl: '/assets/remy/vsop.png',
          durationSeconds: 8,
          status: 'active',
          sortOrder: 1,
          sourceHistoryId: 'hist-sh003-1',
          updatedAt: '2026-11-17 22:05',
        },
      ],
      history: [
        {
          id: 'hist-sh003-1',
          seriesId: 'vsop',
          seriesName: 'VSOP',
          copyMode: 'with-copy',
          title: 'Iconic Harmony for Modern Mixology',
          subtitle:
            'Balanced vanilla, ripe apricot, and soft licorice designed for effortless signature serves.',
          ctaText: 'Touch screen to view cocktail rituals',
          visualStyle: 'modern-french',
          imageUrl: '/assets/remy/vsop.png',
          createdAt: '2026-11-17 22:02',
          expiresAt: '2026-11-22 22:02',
          savedToCarousel: true,
          linkedAdId: 'ad-sh003-vsop',
        },
      ],
    },
  },
];

export function getInitialMockDevices(locale: Locale): ShowcaseDevice[] {
  return locale === 'zh-CN' ? INITIAL_MOCK_DEVICES : INITIAL_MOCK_DEVICES_EN;
}
