import { mockBackend } from '../mocks/mockBackend';
import {
  AiAdImageGenerationResult,
  AdHistoryItem,
  GenerateAdPayload,
  SaveHistoryToCarouselPayload,
  StandbyAdItem,
  StandbyCarouselConfig,
  UpdateAdPayload,
  UpdateStandbySettingsPayload,
} from '../types/cms';
import { API_CONFIG } from './config';
import { httpRequest } from './httpClient';

export const adService = {
  /**
   * Update terminal idle-screen auto-rotation switch and trigger timeout.
   */
  async updateSettings(
    deviceId: string,
    payload: UpdateStandbySettingsPayload
  ): Promise<StandbyCarouselConfig> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.updateStandbySettings(deviceId, payload);
    }
    return httpRequest<StandbyCarouselConfig>(
      `/devices/${encodeURIComponent(deviceId)}/standby-ads/settings`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Generate a candidate standby poster creative from product series / SKU data.
   * Automatically stored in the terminal's recent generation history (e.g. 5 days)
   * without publishing to the active carousel until the operator confirms saving.
   *
   * Only image generation is real in this phase. The generated image is then
   * persisted into the existing local history so the remaining carousel flow
   * can stay on its current Mock implementation.
   */
  async generateAdDraft(
    deviceId: string,
    payload: GenerateAdPayload
  ): Promise<AdHistoryItem> {
    if (!API_CONFIG.useRealAdGenerationApi) {
      return mockBackend.generateStandbyAdDraft(deviceId, payload);
    }

    const generated = await httpRequest<AiAdImageGenerationResult>(
      '/ai-ads/generate',
      {
        method: 'POST',
        body: {
          referenceImageUrl: payload.referenceImageUrl,
          visualStyle: payload.visualStyle,
          promptBrief: payload.promptBrief,
        },
        timeoutMs: 180_000,
      }
    );
    return mockBackend.generateStandbyAdDraft(
      deviceId,
      payload,
      generated.imageUrl
    );
  },

  /**
   * Promote a generated history poster into the active standby carousel playlist.
   */
  async saveHistoryToCarousel(
    deviceId: string,
    payload: SaveHistoryToCarouselPayload
  ): Promise<{ ad: StandbyAdItem; config: StandbyCarouselConfig }> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.saveHistoryToCarousel(deviceId, payload);
    }
    return httpRequest<{ ad: StandbyAdItem; config: StandbyCarouselConfig }>(
      `/devices/${encodeURIComponent(deviceId)}/standby-ads/from-history`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async deleteHistoryItem(
    deviceId: string,
    historyId: string
  ): Promise<StandbyCarouselConfig> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.deleteStandbyHistoryItem(deviceId, historyId);
    }
    return httpRequest<StandbyCarouselConfig>(
      `/devices/${encodeURIComponent(deviceId)}/standby-ads/history/${encodeURIComponent(historyId)}`,
      {
        method: 'DELETE',
      }
    );
  },

  async updateAd(
    deviceId: string,
    adId: string,
    payload: UpdateAdPayload
  ): Promise<StandbyAdItem> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.updateStandbyAd(deviceId, adId, payload);
    }
    return httpRequest<StandbyAdItem>(
      `/devices/${encodeURIComponent(deviceId)}/standby-ads/${encodeURIComponent(adId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  async reorderAds(
    deviceId: string,
    orderedAdIds: string[]
  ): Promise<StandbyAdItem[]> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.reorderStandbyAds(deviceId, orderedAdIds);
    }
    return httpRequest<StandbyAdItem[]>(
      `/devices/${encodeURIComponent(deviceId)}/standby-ads/reorder`,
      {
        method: 'PUT',
        body: JSON.stringify({ orderedAdIds }),
      }
    );
  },

  async deleteAd(
    deviceId: string,
    adId: string
  ): Promise<StandbyCarouselConfig> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.deleteStandbyAd(deviceId, adId);
    }
    return httpRequest<StandbyCarouselConfig>(
      `/devices/${encodeURIComponent(deviceId)}/standby-ads/${encodeURIComponent(adId)}`,
      {
        method: 'DELETE',
      }
    );
  },
};
