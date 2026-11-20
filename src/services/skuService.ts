import { mockBackend } from '../mocks/mockBackend';
import {
  CreateSkuPayload,
  ProductSku,
  UpdateSkuPayload,
} from '../types/cms';
import { API_CONFIG } from './config';
import { httpRequest } from './httpClient';

export const skuService = {
  async listSkusBySeries(deviceId: string, seriesId: string): Promise<ProductSku[]> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.listSkusBySeries(deviceId, seriesId);
    }
    return httpRequest<ProductSku[]>(
      `/devices/${encodeURIComponent(deviceId)}/series/${encodeURIComponent(seriesId)}/skus`,
      { method: 'GET' }
    );
  },

  async createSku(
    deviceId: string,
    seriesId: string,
    payload: CreateSkuPayload
  ): Promise<ProductSku> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.createSku(deviceId, seriesId, payload);
    }
    return httpRequest<ProductSku>(
      `/devices/${encodeURIComponent(deviceId)}/series/${encodeURIComponent(seriesId)}/skus`,
      {
        method: 'POST',
        body: payload,
      }
    );
  },

  async updateSku(
    deviceId: string,
    seriesId: string,
    skuId: string,
    payload: UpdateSkuPayload
  ): Promise<ProductSku> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.updateSku(deviceId, seriesId, skuId, payload);
    }
    return httpRequest<ProductSku>(
      `/devices/${encodeURIComponent(deviceId)}/series/${encodeURIComponent(
        seriesId
      )}/skus/${encodeURIComponent(skuId)}`,
      {
        method: 'PUT',
        body: payload,
      }
    );
  },

  async deleteSku(
    deviceId: string,
    seriesId: string,
    skuId: string
  ): Promise<void> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.deleteSku(deviceId, seriesId, skuId);
    }
    return httpRequest<void>(
      `/devices/${encodeURIComponent(deviceId)}/series/${encodeURIComponent(
        seriesId
      )}/skus/${encodeURIComponent(skuId)}`,
      { method: 'DELETE' }
    );
  },
};
