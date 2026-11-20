import { mockBackend } from '../mocks/mockBackend';
import {
  UploadMediaResult,
  WhiteBackgroundProcessPayload,
  WhiteBackgroundProcessResult,
} from '../types/cms';
import { API_CONFIG } from './config';
import { httpRequest } from './httpClient';

export const mediaService = {
  async uploadSeriesImage(file: File): Promise<UploadMediaResult> {
    if (!API_CONFIG.useRealSeriesApi) {
      return mockBackend.uploadImage(file);
    }
    const formData = new FormData();
    formData.append('file', file);
    return httpRequest<UploadMediaResult>('/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async uploadSkuImage(file: File): Promise<UploadMediaResult> {
    if (!API_CONFIG.useRealSkuApi) {
      return mockBackend.uploadImage(file);
    }
    const formData = new FormData();
    formData.append('file', file);
    return httpRequest<UploadMediaResult>('/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async uploadImage(file: File): Promise<UploadMediaResult> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.uploadImage(file);
    }
    const formData = new FormData();
    formData.append('file', file);
    return httpRequest<UploadMediaResult>('/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Standardize an uploaded product image onto a clean white studio canvas
   * with showcase-ready vertical framing.
   *
   * Integration point for external AI / background-removal plugin:
   * Replace or connect POST /media/white-background on the backend (or wire
   * your third-party plugin SDK directly inside this method).
   */
  async processWhiteBackground(
    payload: WhiteBackgroundProcessPayload
  ): Promise<WhiteBackgroundProcessResult> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.processWhiteBackground(payload);
    }
    return httpRequest<WhiteBackgroundProcessResult>('/media/white-background', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
