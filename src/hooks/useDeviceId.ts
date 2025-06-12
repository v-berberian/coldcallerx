
import { useState, useEffect } from 'react';

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    // Get or create device ID
    let storedDeviceId = localStorage.getItem('coldcaller-device-id');
    
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem('coldcaller-device-id', storedDeviceId);
    }
    
    setDeviceId(storedDeviceId);
  }, []);

  return deviceId;
};
