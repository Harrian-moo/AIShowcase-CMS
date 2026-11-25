import { getStoredLocale } from '../i18n/localeStorage';
import { ApiError } from '../types/api';
import {
  AdHistoryItem,
  AuthSession,
  CloneDeviceContentPayload,
  CreateSeriesPayload,
  CreateSkuPayload,
  GenerateAdPayload,
  LoginRequestPayload,
  ProductSeries,
  ProductSku,
  SaveHistoryToCarouselPayload,
  ShowcaseDevice,
  StandbyAdItem,
  StandbyCarouselConfig,
  UpdateAdPayload,
  UpdateDeviceMetaPayload,
  UpdateSeriesPayload,
  UpdateSkuPayload,
  UpdateStandbySettingsPayload,
  UploadMediaResult,
  WhiteBackgroundProcessPayload,
  WhiteBackgroundProcessResult,
} from '../types/cms';
import { getInitialMockDevices } from './initialDevices';

const MOCK_DEVICES_STORAGE_PREFIX = 'remy_martin_ai_showcase_devices_db_v4_';
const MOCK_LATENCY_MS = 110;

function getDevicesStorageKey(): string {
  return `${MOCK_DEVICES_STORAGE_PREFIX}${getStoredLocale()}`;
}

function localized(zh: string, en: string): string {
  return getStoredLocale() === 'zh-CN' ? zh : en;
}

function formatTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function delay(ms = MOCK_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function formatFutureTimestamp(daysAhead: number): string {
  const future = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const y = future.getFullYear();
  const m = String(future.getMonth() + 1).padStart(2, '0');
  const d = String(future.getDate()).padStart(2, '0');
  const hh = String(future.getHours()).padStart(2, '0');
  const mm = String(future.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function readDevicesDb(): ShowcaseDevice[] {
  const locale = getStoredLocale();
  const seedDevices = getInitialMockDevices(locale);
  try {
    const raw = window.localStorage.getItem(getDevicesStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (parsed as ShowcaseDevice[]).map((device) => {
          const matchingSeed =
            seedDevices.find((item) => item.id === device.id) ?? seedDevices[0];
          if (!device.standbyConfig || !Array.isArray(device.standbyConfig.ads)) {
            return {
              ...device,
              standbyConfig: clone(matchingSeed.standbyConfig),
            };
          }
          return {
            ...device,
            standbyConfig: {
              enabled: device.standbyConfig.enabled ?? true,
              idleTimeoutSeconds: device.standbyConfig.idleTimeoutSeconds ?? 60,
              historyRetentionDays: device.standbyConfig.historyRetentionDays ?? 5,
              ads: device.standbyConfig.ads.map((ad) => ({
                ...ad,
                copyMode:
                  ad.copyMode ??
                  (ad.title || ad.subtitle || ad.ctaText ? 'with-copy' : 'no-copy'),
              })),
              history: Array.isArray(device.standbyConfig.history)
                ? device.standbyConfig.history
                : clone(matchingSeed.standbyConfig.history),
            },
          };
        });
      }
    }
  } catch {
    // Fallback to initial seed devices
  }
  return clone(seedDevices);
}

function writeDevicesDb(devices: ShowcaseDevice[]): void {
  try {
    window.localStorage.setItem(getDevicesStorageKey(), JSON.stringify(devices));
  } catch {
    // Ignore storage quota limits in mock mode
  }
}

function findDeviceIndex(devices: ShowcaseDevice[], deviceId: string): number {
  const index = devices.findIndex((item) => item.id === deviceId);
  if (index === -1) {
    throw new ApiError(
      localized(`未找到已绑定设备（${deviceId}）`, `Bound terminal not found (${deviceId})`),
      404,
      'DEVICE_NOT_FOUND'
    );
  }
  return index;
}

export const mockBackend = {
  async login(payload: LoginRequestPayload): Promise<AuthSession> {
    await delay(150);
    const username = payload.username.trim();
    if (username !== 'admin' || payload.password !== 'admin123') {
      throw new ApiError(
        localized('用户名或密码不正确，请重新输入', 'Incorrect username or password. Please try again.'),
        401,
        'INVALID_CREDENTIALS'
      );
    }
    return {
      accessToken: `mock-jwt-${Date.now()}`,
      tokenType: 'bearer',
      user: {
        username: 'admin',
        displayName: localized('门店管理员', 'Store Manager'),
        role: 'admin',
        storeName: localized('上海静安旗舰店', "Shanghai Jing'an Flagship"),
      },
    };
  },

  async logout(): Promise<void> {
    await delay(60);
  },

  // --- Bound Physical Devices (Mode 1: Pre-assigned, immutable hardware ID) ---

  async listDevices(): Promise<ShowcaseDevice[]> {
    await delay();
    return clone(readDevicesDb());
  },

  async updateDeviceMeta(
    deviceId: string,
    payload: UpdateDeviceMetaPayload
  ): Promise<ShowcaseDevice> {
    await delay();
    const name = payload.name.trim();
    if (!name) {
      throw new ApiError(
        localized('展示柜名称不能为空', 'Showcase display name is required.'),
        400,
        'VALIDATION_ERROR'
      );
    }

    const devices = readDevicesDb();
    const index = findDeviceIndex(devices, deviceId);
    const updated: ShowcaseDevice = {
      ...devices[index],
      name,
      location: payload.location.trim(),
    };

    const next = [...devices];
    next[index] = updated;
    writeDevicesDb(next);
    return clone(updated);
  },

  async cloneDeviceContent(
    targetDeviceId: string,
    payload: CloneDeviceContentPayload
  ): Promise<ShowcaseDevice> {
    await delay(160);
    if (targetDeviceId === payload.sourceDeviceId) {
      throw new ApiError(
        localized('源设备与目标设备不能相同', 'Source and target terminals cannot be the same.'),
        400,
        'INVALID_CLONE_TARGET'
      );
    }

    const devices = readDevicesDb();
    const sourceIndex = findDeviceIndex(devices, payload.sourceDeviceId);
    const targetIndex = findDeviceIndex(devices, targetDeviceId);

    const timestamp = formatTimestamp();
    const clonedSeries = clone(devices[sourceIndex].series).map((series) => ({
      ...series,
      updatedAt: timestamp,
    }));

    const updatedTarget: ShowcaseDevice = {
      ...devices[targetIndex],
      lastSyncedAt: timestamp,
      series: clonedSeries,
    };

    const next = [...devices];
    next[targetIndex] = updatedTarget;
    writeDevicesDb(next);
    return clone(updatedTarget);
  },

  // --- Device-Scoped Product Series ---

  async listSeries(deviceId: string): Promise<ProductSeries[]> {
    await delay();
    const devices = readDevicesDb();
    const index = findDeviceIndex(devices, deviceId);
    return clone(devices[index].series);
  },

  async getSeriesById(deviceId: string, seriesId: string): Promise<ProductSeries> {
    await delay();
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const found = devices[deviceIndex].series.find((item) => item.id === seriesId);
    if (!found) {
      throw new ApiError(
        localized('未找到指定的产品系列', 'Product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }
    return clone(found);
  },

  async createSeries(
    deviceId: string,
    payload: CreateSeriesPayload
  ): Promise<ProductSeries> {
    await delay();
    const name = payload.name.trim();
    if (!name) {
      throw new ApiError(
        localized('产品系列名称不能为空', 'Product series name is required.'),
        400,
        'VALIDATION_ERROR'
      );
    }

    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const timestamp = formatTimestamp();

    const created: ProductSeries = {
      id: payload.id ?? `series-${Date.now()}`,
      name,
      taglineEn: payload.taglineEn?.trim().toUpperCase() || 'HERITAGE',
      taglineZh: payload.taglineZh?.trim() || localized('典藏风范', 'SIGNATURE RESERVE'),
      subtitle: payload.subtitle?.trim() || 'COGNAC FINE CHAMPAGNE',
      description:
        payload.description?.trim() ||
        localized(
          '甄选优质香槟区珍稀生命之水调配而成，呈现优雅而深邃的层次风味。',
          'Crafted from rare Fine Champagne eaux-de-vie, revealing refined elegance and aromatic depth.'
        ),
      imageUrl: payload.imageUrl || '/assets/remy/bottle-club.png',
      tasting: payload.tasting || {
        aromaLabel: localized('香气', 'Aroma'),
        aromaValue: localized('花果 · 香料', 'Floral · Spice'),
        palateLabel: localized('口感', 'Palate'),
        palateValue: localized('圆润 · 醇厚', 'Velvety · Rich'),
        finishLabel: localized('余韵', 'Finish'),
        finishValue: localized('悠长 · 雅致', 'Long · Refined'),
      },
      origin: payload.origin?.trim() || localized('大香槟区 & 小香槟区', 'Grande & Petite Champagne'),
      abv: payload.abv?.trim() || '40% VOL.',
      updatedAt: timestamp,
      skus: [],
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...devices[deviceIndex],
      lastSyncedAt: timestamp,
      series: [...devices[deviceIndex].series, created],
    };
    writeDevicesDb(nextDevices);
    return clone(created);
  },

  async updateSeries(
    deviceId: string,
    seriesId: string,
    payload: UpdateSeriesPayload
  ): Promise<ProductSeries> {
    await delay(90);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const seriesIndex = device.series.findIndex((item) => item.id === seriesId);
    if (seriesIndex === -1) {
      throw new ApiError(
        localized('未找到要更新的产品系列', 'Product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }

    const timestamp = formatTimestamp();
    const updated: ProductSeries = {
      ...device.series[seriesIndex],
      ...payload,
      id: seriesId,
      updatedAt: timestamp,
    };

    const nextSeries = [...device.series];
    nextSeries[seriesIndex] = updated;

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: timestamp,
      series: nextSeries,
    };
    writeDevicesDb(nextDevices);
    return clone(updated);
  },

  async deleteSeries(deviceId: string, seriesId: string): Promise<void> {
    await delay();
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];

    if (device.series.length <= 1) {
      throw new ApiError(
        localized(
          '每台展示柜至少需要保留一个产品系列',
          'Each showcase must keep at least one product series.'
        ),
        400,
        'LAST_SERIES_PROTECTED'
      );
    }

    const nextSeries = device.series.filter((item) => item.id !== seriesId);
    if (nextSeries.length === device.series.length) {
      throw new ApiError(
        localized('未找到要删除的产品系列', 'Product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: formatTimestamp(),
      series: nextSeries,
    };
    writeDevicesDb(nextDevices);
  },

  // --- Device-Scoped Series SKUs ---

  async listSkusBySeries(deviceId: string, seriesId: string): Promise<ProductSku[]> {
    await delay();
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const series = devices[deviceIndex].series.find((item) => item.id === seriesId);
    if (!series) {
      throw new ApiError(
        localized('未找到所属产品系列', 'Product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }
    return clone(series.skus);
  },

  async createSku(
    deviceId: string,
    seriesId: string,
    payload: CreateSkuPayload
  ): Promise<ProductSku> {
    await delay();
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const seriesIndex = device.series.findIndex((item) => item.id === seriesId);
    if (seriesIndex === -1) {
      throw new ApiError(
        localized('未找到所属产品系列', 'Product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }
    if (!payload.name.trim()) {
      throw new ApiError(
        localized('商品名称不能为空', 'Product name is required.'),
        400,
        'VALIDATION_ERROR'
      );
    }

    const timestamp = formatTimestamp();
    const created: ProductSku = {
      ...payload,
      id: `sku-${Date.now()}`,
      seriesId,
      name: payload.name.trim(),
      skuCode: payload.skuCode.trim() || `RM-SKU-${Date.now()}`,
      updatedAt: timestamp,
    };

    const nextSeries = [...device.series];
    nextSeries[seriesIndex] = {
      ...device.series[seriesIndex],
      updatedAt: timestamp,
      skus: [...device.series[seriesIndex].skus, created],
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: timestamp,
      series: nextSeries,
    };
    writeDevicesDb(nextDevices);
    return clone(created);
  },

  async updateSku(
    deviceId: string,
    seriesId: string,
    skuId: string,
    payload: UpdateSkuPayload
  ): Promise<ProductSku> {
    await delay();
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const seriesIndex = device.series.findIndex((item) => item.id === seriesId);
    if (seriesIndex === -1) {
      throw new ApiError(
        localized('未找到所属产品系列', 'Product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }

    const series = device.series[seriesIndex];
    const skuIndex = series.skus.findIndex((item) => item.id === skuId);
    if (skuIndex === -1) {
      throw new ApiError(
        localized('未找到要更新的 SKU 商品', 'SKU item not found.'),
        404,
        'SKU_NOT_FOUND'
      );
    }

    const timestamp = formatTimestamp();
    const updatedSku: ProductSku = {
      ...payload,
      id: skuId,
      seriesId,
      name: payload.name.trim(),
      skuCode: payload.skuCode.trim(),
      updatedAt: timestamp,
    };

    const nextSkus = [...series.skus];
    nextSkus[skuIndex] = updatedSku;

    const nextSeries = [...device.series];
    nextSeries[seriesIndex] = {
      ...series,
      updatedAt: timestamp,
      skus: nextSkus,
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: timestamp,
      series: nextSeries,
    };
    writeDevicesDb(nextDevices);
    return clone(updatedSku);
  },

  async deleteSku(deviceId: string, seriesId: string, skuId: string): Promise<void> {
    await delay();
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const seriesIndex = device.series.findIndex((item) => item.id === seriesId);
    if (seriesIndex === -1) {
      throw new ApiError(
        localized('未找到所属产品系列', 'Product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }

    const series = device.series[seriesIndex];
    const nextSkus = series.skus.filter((item) => item.id !== skuId);
    if (nextSkus.length === series.skus.length) {
      throw new ApiError(
        localized('未找到要删除的 SKU 商品', 'SKU item not found.'),
        404,
        'SKU_NOT_FOUND'
      );
    }

    const timestamp = formatTimestamp();
    const nextSeries = [...device.series];
    nextSeries[seriesIndex] = {
      ...series,
      updatedAt: timestamp,
      skus: nextSkus,
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: timestamp,
      series: nextSeries,
    };
    writeDevicesDb(nextDevices);
  },

  async uploadImage(file: File): Promise<UploadMediaResult> {
    await delay(100);
    if (!file.type.startsWith('image/')) {
      throw new ApiError(
        localized('仅支持上传图片格式文件', 'Only image files are supported for upload.'),
        400,
        'INVALID_MEDIA_TYPE'
      );
    }
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(
            new ApiError(
              localized('图片读取失败', 'Failed to read image file.'),
              500,
              'MEDIA_READ_ERROR'
            )
          );
        }
      };
      reader.onerror = () =>
        reject(
          new ApiError(
            localized('图片读取失败', 'Failed to read image file.'),
            500,
            'MEDIA_READ_ERROR'
          )
        );
      reader.readAsDataURL(file);
    });
    return {
      url,
      filename: file.name,
    };
  },

  async processWhiteBackground(
    payload: WhiteBackgroundProcessPayload
  ): Promise<WhiteBackgroundProcessResult> {
    await delay(420);
    if (!payload.imageUrl) {
      throw new ApiError(
        localized('请先上传商品图片后再执行白底图处理', 'Please upload a product image first.'),
        400,
        'MEDIA_REQUIRED'
      );
    }

    const canvasWidth = 900;
    const canvasHeight =
      payload.targetAspectRatio === '1:1'
        ? 900
        : payload.targetAspectRatio === '4:5'
          ? 1125
          : 1200;
    const bgColor = payload.backgroundColor || '#FFFFFF';
    const paddingRatio = payload.paddingRatio ?? 0.08;

    try {
      const processedUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(payload.imageUrl);
              return;
            }
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            const maxW = canvasWidth * (1 - paddingRatio * 2);
            const maxH = canvasHeight * (1 - paddingRatio * 2);
            const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
            const drawW = img.naturalWidth * scale;
            const drawH = img.naturalHeight * scale;
            const offsetX = (canvasWidth - drawW) / 2;
            const offsetY = (canvasHeight - drawH) / 2;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

            resolve(canvas.toDataURL('image/png'));
          } catch {
            resolve(payload.imageUrl);
          }
        };
        img.onerror = () =>
          reject(
            new ApiError(
              localized('白底图处理失败，请重试', 'White-background processing failed.'),
              500,
              'MEDIA_PROCESS_ERROR'
            )
          );
        img.src = payload.imageUrl;
      });

      return {
        url: processedUrl,
        width: canvasWidth,
        height: canvasHeight,
        provider: 'local-canvas-placeholder',
        isMockPlaceholder: true,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      return {
        url: payload.imageUrl,
        width: canvasWidth,
        height: canvasHeight,
        provider: 'local-canvas-placeholder',
        isMockPlaceholder: true,
      };
    }
  },

  // --- AI Standby Carousel Ads (per bound showcase device) ---

  async updateStandbySettings(
    deviceId: string,
    payload: UpdateStandbySettingsPayload
  ): Promise<StandbyCarouselConfig> {
    await delay(100);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const timestamp = formatTimestamp();

    const nextConfig: StandbyCarouselConfig = {
      ...device.standbyConfig,
      enabled: payload.enabled,
      idleTimeoutSeconds: Math.max(15, payload.idleTimeoutSeconds),
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: timestamp,
      standbyConfig: nextConfig,
    };
    writeDevicesDb(nextDevices);
    return clone(nextConfig);
  },

  async generateStandbyAdDraft(
    deviceId: string,
    payload: GenerateAdPayload,
    generatedImageUrl?: string
  ): Promise<AdHistoryItem> {
    await delay(520);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const series = device.series.find((item) => item.id === payload.seriesId);
    if (!series) {
      throw new ApiError(
        localized('未找到关联的产品系列', 'Selected product series not found.'),
        404,
        'SERIES_NOT_FOUND'
      );
    }

    const sku = payload.skuId
      ? series.skus.find((item) => item.id === payload.skuId)
      : undefined;
    const timestamp = formatTimestamp();
    const retentionDays = device.standbyConfig.historyRetentionDays || 5;
    const expiresAt = formatFutureTimestamp(retentionDays);
    const isNoCopy = payload.copyMode === 'no-copy';

    const trimmedTitle = isNoCopy ? '' : (payload.title ?? '').trim();
    const trimmedSubtitle = isNoCopy ? '' : (payload.subtitle ?? '').trim();
    const trimmedCta = isNoCopy ? '' : (payload.ctaText ?? '').trim();

    // If user chose "with-copy" and left all three fields empty, provide a clean default headline
    const isEn = getStoredLocale() === 'en';
    const fallbackHeadline =
      !isNoCopy && !trimmedTitle && !trimmedSubtitle && !trimmedCta
        ? isEn
          ? `${series.name} · ${series.taglineEn || 'Fine Champagne Cognac'}`
          : `${series.name} · ${series.taglineZh || '优质香槟区干邑'}`
        : trimmedTitle;

    const historyItem: AdHistoryItem = {
      id: `hist-${Date.now().toString(36)}`,
      seriesId: series.id,
      skuId: sku?.id,
      seriesName: series.name,
      skuName: sku?.name,
      copyMode: payload.copyMode,
      title: fallbackHeadline,
      subtitle: trimmedSubtitle,
      ctaText: trimmedCta,
      visualStyle: payload.visualStyle,
      imageUrl: generatedImageUrl || sku?.imageUrl || series.imageUrl,
      promptBrief: payload.promptBrief?.trim() || undefined,
      createdAt: timestamp,
      expiresAt,
      savedToCarousel: false,
      isMockGenerated: !generatedImageUrl,
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      standbyConfig: {
        ...device.standbyConfig,
        history: [historyItem, ...(device.standbyConfig.history ?? [])],
      },
    };
    writeDevicesDb(nextDevices);
    return clone(historyItem);
  },

  async saveHistoryToCarousel(
    deviceId: string,
    payload: SaveHistoryToCarouselPayload
  ): Promise<{ ad: StandbyAdItem; config: StandbyCarouselConfig }> {
    await delay(140);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const historyItem = (device.standbyConfig.history ?? []).find(
      (item) => item.id === payload.historyId
    );
    if (!historyItem) {
      throw new ApiError(
        localized('未找到对应的生成历史记录', 'Generation history record not found.'),
        404,
        'AD_NOT_FOUND'
      );
    }

    const timestamp = formatTimestamp();
    const nextOrder =
      device.standbyConfig.ads.reduce((max, ad) => Math.max(max, ad.sortOrder), 0) + 1;

    const newAd: StandbyAdItem = {
      id: `ad-${Date.now().toString(36)}`,
      seriesId: historyItem.seriesId,
      skuId: historyItem.skuId,
      seriesName: historyItem.seriesName,
      copyMode: historyItem.copyMode,
      title: historyItem.title,
      subtitle: historyItem.subtitle,
      ctaText: historyItem.ctaText,
      visualStyle: historyItem.visualStyle,
      imageUrl: historyItem.imageUrl,
      durationSeconds: payload.durationSeconds ?? 8,
      status: 'active',
      sortOrder: nextOrder,
      promptBrief: historyItem.promptBrief,
      sourceHistoryId: historyItem.id,
      updatedAt: timestamp,
      isMockGenerated: historyItem.isMockGenerated,
    };

    const nextHistory = (device.standbyConfig.history ?? []).map((item) =>
      item.id === historyItem.id
        ? { ...item, savedToCarousel: true, linkedAdId: newAd.id }
        : item
    );

    const nextConfig: StandbyCarouselConfig = {
      ...device.standbyConfig,
      ads: [...device.standbyConfig.ads, newAd],
      history: nextHistory,
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: timestamp,
      standbyConfig: nextConfig,
    };
    writeDevicesDb(nextDevices);
    return {
      ad: clone(newAd),
      config: clone(nextConfig),
    };
  },

  async deleteStandbyHistoryItem(
    deviceId: string,
    historyId: string
  ): Promise<StandbyCarouselConfig> {
    await delay(90);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const nextConfig: StandbyCarouselConfig = {
      ...device.standbyConfig,
      history: (device.standbyConfig.history ?? []).filter(
        (item) => item.id !== historyId
      ),
    };
    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      standbyConfig: nextConfig,
    };
    writeDevicesDb(nextDevices);
    return clone(nextConfig);
  },

  async updateStandbyAd(
    deviceId: string,
    adId: string,
    payload: UpdateAdPayload
  ): Promise<StandbyAdItem> {
    await delay(110);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const adIndex = device.standbyConfig.ads.findIndex((item) => item.id === adId);
    if (adIndex === -1) {
      throw new ApiError(
        localized('未找到指定的轮播广告', 'Standby ad not found.'),
        404,
        'AD_NOT_FOUND'
      );
    }

    const existing = device.standbyConfig.ads[adIndex];
    const timestamp = formatTimestamp();
    const isNoCopy = existing.copyMode === 'no-copy';
    const updatedAd: StandbyAdItem = {
      ...existing,
      title: isNoCopy ? '' : payload.title.trim(),
      subtitle: isNoCopy ? '' : payload.subtitle.trim(),
      ctaText: isNoCopy ? '' : payload.ctaText.trim(),
      durationSeconds: payload.durationSeconds,
      status: payload.status,
      updatedAt: timestamp,
    };

    const nextAds = [...device.standbyConfig.ads];
    nextAds[adIndex] = updatedAd;

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: timestamp,
      standbyConfig: {
        ...device.standbyConfig,
        ads: nextAds,
      },
    };
    writeDevicesDb(nextDevices);
    return clone(updatedAd);
  },

  async reorderStandbyAds(
    deviceId: string,
    orderedAdIds: string[]
  ): Promise<StandbyAdItem[]> {
    await delay(80);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const adMap = new Map(device.standbyConfig.ads.map((item) => [item.id, item]));

    const reordered: StandbyAdItem[] = [];
    orderedAdIds.forEach((id) => {
      const found = adMap.get(id);
      if (found) {
        reordered.push({ ...found, sortOrder: reordered.length + 1 });
        adMap.delete(id);
      }
    });
    adMap.forEach((remaining) => {
      reordered.push({ ...remaining, sortOrder: reordered.length + 1 });
    });

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: formatTimestamp(),
      standbyConfig: {
        ...device.standbyConfig,
        ads: reordered,
      },
    };
    writeDevicesDb(nextDevices);
    return clone(reordered);
  },

  async deleteStandbyAd(
    deviceId: string,
    adId: string
  ): Promise<StandbyCarouselConfig> {
    await delay(100);
    const devices = readDevicesDb();
    const deviceIndex = findDeviceIndex(devices, deviceId);
    const device = devices[deviceIndex];
    const nextAds = device.standbyConfig.ads
      .filter((item) => item.id !== adId)
      .map((item, idx) => ({ ...item, sortOrder: idx + 1 }));

    const nextHistory = (device.standbyConfig.history ?? []).map((item) =>
      item.linkedAdId === adId
        ? { ...item, savedToCarousel: false, linkedAdId: undefined }
        : item
    );

    const nextConfig: StandbyCarouselConfig = {
      ...device.standbyConfig,
      ads: nextAds,
      history: nextHistory,
    };

    const nextDevices = [...devices];
    nextDevices[deviceIndex] = {
      ...device,
      lastSyncedAt: formatTimestamp(),
      standbyConfig: nextConfig,
    };
    writeDevicesDb(nextDevices);
    return clone(nextConfig);
  },
};
