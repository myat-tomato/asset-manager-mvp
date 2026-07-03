//optionService.ts

import { gasRequest } from './gasApi';

export type DeviceOptions = {
  currentUsers: string[];
  statuses: string[];
  classifications: string[];
  locations: string[];
  purposes: string[];
  categories: string[];
};

export function getDeviceOptions() {
  return gasRequest<DeviceOptions>('getDeviceOptions');
}