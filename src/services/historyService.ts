import { gasRequest } from './gasApi';

export type DeviceHistory = {
  deviceNo: string;
  updatedAt: string;
  updatedBy: string;
  changes: string;
};

export function getDeviceHistory(deviceNo: string) {
  return gasRequest<DeviceHistory[]>('getDeviceHistory', { deviceNo });
}