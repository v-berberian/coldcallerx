
// Device management utilities for multi-device session support

const DEVICE_ID_KEY = 'coldcaller-device-id';

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate a new device ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

export const clearDeviceId = (): void => {
  localStorage.removeItem(DEVICE_ID_KEY);
};

export const generateNewDeviceId = (): string => {
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
};
