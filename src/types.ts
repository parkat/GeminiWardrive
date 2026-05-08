export type SignalType = 'WiFi' | 'Bluetooth' | 'SDR' | 'Cellular';

export interface SignalPoint {
  id: string;
  timestamp: number;
  type: SignalType;
  ssid?: string;
  mac: string;
  rssi: number;
  frequency?: number;
  security?: string;
  lat: number;
  lng: number;
  alt?: number;
  sessionId: string;
  manufacturer?: string;
}

export interface Session {
  id: string;
  startTime: number;
  endTime?: number;
  name: string;
  deviceInfo: string;
  pointCount: number;
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface HardwareStats {
  cpuUsage: number;
  memoryUsage: number;
  batteryLevel: number;
  uptime: number;
  gpsStatus: 'Locked' | 'Searching' | 'Disconnected';
  activeSignals: number;
}
