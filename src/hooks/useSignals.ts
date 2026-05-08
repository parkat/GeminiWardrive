import { useState, useEffect } from 'react';
import { SignalPoint, HardwareStats } from '../types';

export function useSignals() {
  const [signals, setSignals] = useState<SignalPoint[]>([]);
  const [stats, setStats] = useState<HardwareStats>({
    cpuUsage: 12,
    memoryUsage: 45,
    batteryLevel: 98,
    uptime: 3600,
    gpsStatus: 'Searching',
    activeSignals: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random WiFi detections
      if (Math.random() > 0.3) {
        const newSignal: SignalPoint = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          type: Math.random() > 0.2 ? 'WiFi' : 'Bluetooth',
          ssid: Math.random() > 0.5 ? `SSID_${Math.floor(Math.random() * 100)}` : undefined,
          mac: Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0')).join(':'),
          rssi: -Math.floor(Math.random() * 60 + 30),
          lat: 34.0522 + (Math.random() - 0.5) * 0.001,
          lng: -118.2437 + (Math.random() - 0.5) * 0.001,
          sessionId: 'current-session'
        };
        
        setSignals(prev => [newSignal, ...prev].slice(0, 50));
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 20 + 10),
        memoryUsage: Math.floor(Math.random() * 5 + 40),
        batteryLevel: Math.max(0, prev.batteryLevel - 0.01),
        uptime: prev.uptime + 1,
        gpsStatus: 'Locked',
        activeSignals: signals.length
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [signals.length]);

  return { signals, stats };
}
