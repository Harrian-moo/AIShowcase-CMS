import { mockBackend } from '../mocks/mockBackend';
import {
  CreateSeriesPayload,
  ProductSeries,
  SeriesBasicInfo,
  SeriesTranslation,
  SeriesTranslationPayload,
  UpdateSeriesBasicInfoPayload,
  UpdateSeriesPayload,
} from '../types/cms';
import { API_CONFIG } from './config';
import { httpRequest } from './httpClient';

function toBasicInfo(series: ProductSeries): SeriesBasicInfo {
  return {
    id: series.id,
    name: series.name,
    subtitle: series.subtitle,
    taglineZh: series.taglineZh,
    taglineEn: series.taglineEn,
    description: series.description,
    imageUrl: series.imageUrl,
    tasting: series.tasting,
    origin: series.origin,
    abv: series.abv,
    updatedAt: series.updatedAt,
  };
}

export const seriesService = {
  async listTranslations(seriesId: string): Promise<SeriesTranslation[]> {
    return httpRequest<SeriesTranslation[]>(
      `/series/${encodeURIComponent(seriesId)}/translations`,
      { method: 'GET' }
    );
  },

  async updateTranslation(
    seriesId: string,
    locale: SeriesTranslation['locale'],
    payload: SeriesTranslationPayload
  ): Promise<SeriesTranslation> {
    return httpRequest<SeriesTranslation>(
      `/series/${encodeURIComponent(seriesId)}/translations/${encodeURIComponent(locale)}`,
      { method: 'PUT', body: payload }
    );
  },

  async listBasicSeries(deviceId: string): Promise<SeriesBasicInfo[]> {
    if (!API_CONFIG.useRealSeriesApi) {
      const series = await mockBackend.listSeries(deviceId);
      return series.map(toBasicInfo);
    }
    return httpRequest<SeriesBasicInfo[]>('/series', { method: 'GET' });
  },

  async getBasicSeries(
    deviceId: string,
    seriesId: string
  ): Promise<SeriesBasicInfo> {
    if (!API_CONFIG.useRealSeriesApi) {
      return toBasicInfo(await mockBackend.getSeriesById(deviceId, seriesId));
    }
    return httpRequest<SeriesBasicInfo>(
      `/series/${encodeURIComponent(seriesId)}`,
      { method: 'GET' }
    );
  },

  async updateBasicSeries(
    deviceId: string,
    seriesId: string,
    payload: UpdateSeriesBasicInfoPayload
  ): Promise<SeriesBasicInfo> {
    if (!API_CONFIG.useRealSeriesApi) {
      const existing = await mockBackend.getSeriesById(deviceId, seriesId);
      const updated = await mockBackend.updateSeries(deviceId, seriesId, {
        name: payload.name,
        subtitle: payload.subtitle,
        taglineZh: payload.taglineZh,
        taglineEn: payload.taglineEn,
        description: payload.description,
        imageUrl: payload.imageUrl,
        tasting: payload.tasting,
        origin: payload.origin,
        abv: payload.abv,
      });
      return toBasicInfo(updated);
    }
    return httpRequest<SeriesBasicInfo>(
      `/series/${encodeURIComponent(seriesId)}`,
      {
        method: 'PUT',
        body: payload,
      }
    );
  },

  async listSeries(deviceId: string): Promise<ProductSeries[]> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.listSeries(deviceId);
    }
    return httpRequest<ProductSeries[]>(
      `/devices/${encodeURIComponent(deviceId)}/series`,
      { method: 'GET' }
    );
  },

  async getSeriesById(deviceId: string, seriesId: string): Promise<ProductSeries> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.getSeriesById(deviceId, seriesId);
    }
    return httpRequest<ProductSeries>(
      `/devices/${encodeURIComponent(deviceId)}/series/${encodeURIComponent(seriesId)}`,
      { method: 'GET' }
    );
  },

  async createSeries(
    deviceId: string,
    payload: CreateSeriesPayload
  ): Promise<ProductSeries> {
    if (API_CONFIG.useRealSeriesApi) {
      const createdBasic = await httpRequest<SeriesBasicInfo>('/series', {
        method: 'POST',
        body: {
          name: payload.name,
          subtitle: payload.subtitle ?? '',
          taglineZh: payload.taglineZh ?? '',
          taglineEn: payload.taglineEn ?? '',
          description: payload.description ?? '',
        },
      });
      const createdMock = await mockBackend.createSeries(deviceId, {
        ...payload,
        id: createdBasic.id,
        name: createdBasic.name,
        subtitle: createdBasic.subtitle,
        taglineZh: createdBasic.taglineZh,
        taglineEn: createdBasic.taglineEn,
        description: createdBasic.description,
      });
      return { ...createdMock, ...createdBasic };
    }
    if (API_CONFIG.useMockApi) {
      return mockBackend.createSeries(deviceId, payload);
    }
    return httpRequest<ProductSeries>(
      `/devices/${encodeURIComponent(deviceId)}/series`,
      {
        method: 'POST',
        body: payload,
      }
    );
  },

  async updateSeries(
    deviceId: string,
    seriesId: string,
    payload: UpdateSeriesPayload
  ): Promise<ProductSeries> {
    if (API_CONFIG.useRealSeriesApi) {
      const savedBasic = await httpRequest<SeriesBasicInfo>(
        `/series/${encodeURIComponent(seriesId)}`,
        {
          method: 'PUT',
          body: {
            name: payload.name,
            subtitle: payload.subtitle,
            taglineZh: payload.taglineZh,
            taglineEn: payload.taglineEn,
            description: payload.description,
            imageUrl: payload.imageUrl,
            tasting: payload.tasting,
            origin: payload.origin,
            abv: payload.abv,
          } satisfies UpdateSeriesBasicInfoPayload,
        }
      );

      // SKU data remains in Mock storage until its own backend phase.
      const savedMock = await mockBackend.updateSeries(deviceId, seriesId, {
        ...payload,
        ...savedBasic,
      });
      return { ...savedMock, ...savedBasic };
    }
    if (API_CONFIG.useMockApi) {
      return mockBackend.updateSeries(deviceId, seriesId, payload);
    }
    return httpRequest<ProductSeries>(
      `/devices/${encodeURIComponent(deviceId)}/series/${encodeURIComponent(seriesId)}`,
      {
        method: 'PUT',
        body: payload,
      }
    );
  },

  async deleteSeries(deviceId: string, seriesId: string): Promise<void> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.deleteSeries(deviceId, seriesId);
    }
    return httpRequest<void>(
      `/devices/${encodeURIComponent(deviceId)}/series/${encodeURIComponent(seriesId)}`,
      { method: 'DELETE' }
    );
  },
};
