import { gasRequest } from './gasApi';

export type Device = {
  status: string;
  classification: string;
  purpose: string;
  category: string;
  deviceNo: string;
  deviceName: string;
  currentUser: string;
  employmentStatus: string;
  previousUser: string;
  location: string;
  condition: string;
  notes: string;
  loanDate: string;
  loanSlip: string;
  manufacturer: string;
  modelName: string;
  cpu: string;
  ram: string;
  purchaseDate: string;
  osName: string;
  osLicense: string;
  backupImageDate: string;
  loginAccount: string;
  officeLicense: string;
  ip: string;
};

export type CreateDevicePayload = {
  deviceNo: string;
  deviceName: string;
  status: string;
  classification: string;
  purpose: string;
  category: string;
  currentUser: string;
  employmentStatus: string;
  previousUser: string;
  location: string;
  condition: string;
  notes: string;
  loanDate: string;
  loanSlip: string;
  manufacturer: string;
  modelName: string;
  cpu: string;
  ram: string;
  purchaseDate: string;
  osName: string;
  osLicense: string;
  backupImageDate: string;
  loginAccount: string;
  officeLicense: string;
  ip: string;
};

export type UpdateDeviceResult = {
  updated: boolean;
  deviceNo: string;
  changes: Record<string, unknown>;
};

export function getDeviceList(keyword = '') {
  return gasRequest<Device[]>('getDeviceList', { keyword });
}

export function getDeviceByNo(deviceNo: string) {
  return gasRequest<Device | null>('getDeviceByNo', { deviceNo });
}

export function createDevice(device: CreateDevicePayload) {
  return gasRequest<Device>('createDevice', { device });
}

export function updateDevice(device: Device) {
  return gasRequest<UpdateDeviceResult>(
    'updateDevice',
    device as unknown as Record<string, unknown>
  );
}