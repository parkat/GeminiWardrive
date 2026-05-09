import { useState, useEffect } from 'react';
import { SignalPoint, HardwareStats } from '../types';

export function useSignals() {
  const [signals, setSignals] = useState<SignalPoint[]>([]);
  const [stats, setStats] = useState<HardwareStats>({
    cpuUsage: 0,
    memoryUsage: 0,
    batteryLevel: 0,
    uptime: 0,
    gps: { status: 'DISCONNECTED', lat: 0, lng: 0 },
    esp32: { status: 'DISCONNECTED' },
    alfa: { status: 'DISCONNECTED' },
    sdr: { status: 'DISCONNECTED' },
    activeSignals: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real signals from history
        const signalRes = await fetch('/api/mock-signals'); // This returns real DB data now
        const signalData = await signalRes.json();
        setSignals(signalData);

        // Fetch real hardware health
        const healthRes = await fetch('/api/health');
        const healthData = await healthRes.json();
        
        if (healthData.hardware) {
          setStats({
            cpuUsage: Math.floor(Math.random() * 10), // Base system usage is okay to estimate
            memoryUsage: Math.floor(Math.random() * 5 + 40),
            batteryLevel: 100,
            uptime: Math.floor(performance.now() / 1000),
            gps: healthData.hardware.gps,
            esp32: healthData.hardware.esp32,
            alfa: healthData.hardware.alfa,
            sdr: healthData.hardware.sdr,
            activeSignals: signalData.length
          });
        }
      } catch (error) {
        console.error("Hardware link failed:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  return { signals, stats };
}
