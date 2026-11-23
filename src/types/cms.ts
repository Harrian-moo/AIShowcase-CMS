import type { Locale } from '../i18n/localeStorage';

export interface TastingNotes {
  aromaLabel: string;
  aromaValue: string;
  palateLabel: string;
  palateValue: string;
  finishLabel: string;
  finishValue: string;
}

export type SkuStatus = 'active' | 'inactive';

export interface ProductSku {
  id: string;
  seriesId: string;
  skuCode: string;
  name: string;
  englishName: string;
  volume: string;
  abv: string;
  price: string;
  packaging: string;
  shelfSlot: string;
  status: SkuStatus;
  sortOrder: number;
  highlight: string;
  description: string;
  servingSuggestion: string;
  imageUrl: string;
  updatedAt: string;
}

export interface ProductSeries {
  id: string;
  name: string;
  taglineEn: string;
  taglineZh: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  tasting: TastingNotes;
  origin: string;
  abv: string;
  updatedAt: string;
  skus: ProductSku[];
}

export interface SeriesBasicInfo {
  id: string;
  name: string;
  subtitle: string;
  taglineZh: string;
  taglineEn: string;
  description: string;
  imageUrl: string;
  tasting: TastingNotes;
  origin: string;
  abv: string;
  updatedAt: string;
}

export interface UpdateSeriesBasicInfoPayload {
  name: string;
  subtitle: string;
  taglineZh: string;
  taglineEn: string;
  description: string;
  imageUrl: string;
  tasting: TastingNotes;
  origin: string;
  abv: string;
}

export type DeviceConnectionStatus = 'online' | 'offline';

export type AdVisualStyle =
  | 'luxury-studio'
  | 'nocturne-lounge'
  | 'festive-gifting'
  | 'modern-french';

export type AdStatus = 'active' | 'paused';

export type AdCopyMode = 'with-copy' | 'no-copy';

export interface StandbyAdItem {
  id: string;
  seriesId: string;
  skuId?: string;
  seriesName: string;
  copyMode: AdCopyMode;
  title: string;
  subtitle: string;
  ctaText: string;
  visualStyle: AdVisualStyle;
  imageUrl: string;
  durationSeconds: number;
  status: AdStatus;
  sortOrder: number;
  promptBrief?: string;
  sourceHistoryId?: string;
  updatedAt: string;
  isMockGenerated?: boolean;
}

export interface AdHistoryItem {
  id: string;
  seriesId: string;
  skuId?: string;
  seriesName: string;
  skuName?: string;
  copyMode: AdCopyMode;
  title: string;
  subtitle: string;
  ctaText: string;
  visualStyle: AdVisualStyle;
  imageUrl: string;
  promptBrief?: string;
  createdAt: string;
  expiresAt: string;
  savedToCarousel: boolean;
  linkedAdId?: string;
  isMockGenerated?: boolean;
}

export interface StandbyCarouselConfig {
  enabled: boolean;
  idleTimeoutSeconds: number;
  historyRetentionDays: number;
  ads: StandbyAdItem[];
  history: AdHistoryItem[];
}

export interface ShowcaseDevice {
  /** Immutable hardware identifier bound to the physical screen system */
  id: string;
  /** Immutable factory hardware serial number */
  serialNumber: string;
  /** Store-editable display name */
  name: string;
  /** Store-editable physical placement description */
  location: string;
  /** Read-only screen resolution reported by the hardware terminal */
  resolution: string;
  connectionStatus: DeviceConnectionStatus;
  lastSyncedAt: string;
  series: ProductSeries[];
  standbyConfig: StandbyCarouselConfig;
}

export interface UpdateDeviceMetaPayload {
  name: string;
  location: string;
}

export interface CloneDeviceContentPayload {
  sourceDeviceId: string;
}

export interface AuthUser {
  username: string;
  displayName: string;
  role: 'admin';
  storeName: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'bearer';
  user: AuthUser;
}

export interface LoginRequestPayload {
  username: string;
  password: string;
}

export interface CreateSeriesPayload {
  /** Internal ID used to keep the phase-1 Mock shell aligned with SQLite. */
  id?: string;
  name: string;
  taglineEn?: string;
  taglineZh?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  tasting?: TastingNotes;
  origin?: string;
  abv?: string;
}

export type UpdateSeriesPayload = Omit<ProductSeries, 'id' | 'skus' | 'updatedAt'>;

export type CreateSkuPayload = Omit<ProductSku, 'id' | 'seriesId' | 'updatedAt'>;

export type UpdateSkuPayload = Omit<ProductSku, 'id' | 'seriesId' | 'updatedAt'>;

export interface SeriesTranslationPayload {
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  tasting: TastingNotes;
  origin: string;
}

export interface SeriesTranslation extends SeriesTranslationPayload {
  locale: Locale;
  updatedAt: string;
}

export interface SkuTranslationPayload {
  name: string;
  packaging: string;
  highlight: string;
  description: string;
  servingSuggestion: string;
}

export interface SkuTranslation extends SkuTranslationPayload {
  locale: Locale;
  updatedAt: string;
}

export interface UploadMediaResult {
  url: string;
  filename: string;
}

export interface WhiteBackgroundProcessPayload {
  imageUrl: string;
  targetAspectRatio?: '3:4' | '4:5' | '1:1';
  backgroundColor?: string;
  paddingRatio?: number;
}

export interface WhiteBackgroundProcessResult {
  url: string;
  width?: number;
  height?: number;
  provider?: string;
  isMockPlaceholder?: boolean;
}

export interface GenerateAdPayload {
  seriesId: string;
  skuId?: string;
  visualStyle: AdVisualStyle;
  copyMode: AdCopyMode;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  promptBrief?: string;
}

export interface UpdateAdPayload {
  title: string;
  subtitle: string;
  ctaText: string;
  durationSeconds: number;
  status: AdStatus;
}

export interface SaveHistoryToCarouselPayload {
  historyId: string;
  durationSeconds?: number;
}

export interface UpdateStandbySettingsPayload {
  enabled: boolean;
  idleTimeoutSeconds: number;
}

export type CmsWorkspaceView = 'series-edit' | 'sku-list' | 'ai-ads' | 'device-manage';
