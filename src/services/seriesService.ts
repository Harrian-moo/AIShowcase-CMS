import { mockBackend } from '../mocks/mockBackend';
import {
  CreateSeriesPayload,
  ProductSeries,
  UpdateSeriesPayload,
} from '../types/cms';
import { API_CONFIG } from './config';
import { httpRequest } from './httpClient';

export const seriesService = {
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
