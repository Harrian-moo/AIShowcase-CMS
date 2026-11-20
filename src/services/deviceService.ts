import { mockBackend } from '../mocks/mockBackend';
import {
  CloneDeviceContentPayload,
  ShowcaseDevice,
  UpdateDeviceMetaPayload,
} from '../types/cms';
import { API_CONFIG } from './config';
import { httpRequest } from './httpClient';

/**
 * Mode 1 (Pre-assigned hardware devices):
 * Store CMS does not arbitrarily create or delete hardware device IDs.
 * It reads bound devices, updates display metadata (name/location), and clones content between bound devices.
 */
export const deviceService = {
  async listDevices(): Promise<ShowcaseDevice[]> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.listDevices();
    }
    return httpRequest<ShowcaseDevice[]>('/devices', { method: 'GET' });
  },

  async updateDeviceMeta(
    deviceId: string,
    payload: UpdateDeviceMetaPayload
  ): Promise<ShowcaseDevice> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.updateDeviceMeta(deviceId, payload);
    }
    return httpRequest<ShowcaseDevice>(
      `/devices/${encodeURIComponent(deviceId)}`,
      {
        method: 'PATCH',
        body: payload,
      }
    );
  },

  async cloneDeviceContent(
    targetDeviceId: string,
    payload: CloneDeviceContentPayload
  ): Promise<ShowcaseDevice> {
    if (API_CONFIG.useMockApi) {
      return mockBackend.cloneDeviceContent(targetDeviceId, payload);
    }
    return httpRequest<ShowcaseDevice>(
      `/devices/${encodeURIComponent(targetDeviceId)}/clone-content`,
      {
        method: 'POST',
        body: payload,
      }
    );
  },
};
