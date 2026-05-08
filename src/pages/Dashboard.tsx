import React from 'react';
import { useSignals } from '../hooks/useSignals';
import { Cpu, Database, Battery, MapPin, Signal, Wifi, Bluetooth, Radio, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { signals, stats } = useSignals();

  const wifiCount = signals.filter(s => s.type === 'WiFi').length;
  const bleCount = signals.filter(s => s.type === 'Bluetooth').length;

  // Prepare chart data
  const chartData = signals.slice(0, 15).reverse().map((s, i) => ({
    time: i,
    rssi: Math.abs(s.rssi)
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Sidebar Mini-Stats (Left on Desktop) */}
        <div className="space-y-6 hidden xl:block">
           <section>
              <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4">Capture Stats</h3>
              <div className="space-y-4">
                 <DisplayStat label="Access Points" value={wifiCount + 1482} />
                 <DisplayStat label="BLE Devices" value={bleCount + 419} color="text-brand-cyan" />
                 <DisplayStat label="Handshakes" value="24" color="text-brand-amber" />
              </div>
           </section>

           <section>
              <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4">Security Types</h3>
              <div className="space-y-2">
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-brand-red" style={{ width: '15%' }}></div>
                    <div className="h-full bg-brand-amber" style={{ width: '45%' }}></div>
                    <div className="h-full bg-brand-cyan" style={{ width: '40%' }}></div>
                 </div>
                 <ul className="text-[11px] font-mono space-y-1 mt-2 uppercase">
                    <li className="flex justify-between"><span className="text-brand-red">● Open</span> <span>15%</span></li>
                    <li className="flex justify-between"><span className="text-brand-amber">● WPA2</span> <span>45%</span></li>
                    <li className="flex justify-between"><span className="text-brand-cyan">● WPA3</span> <span>40%</span></li>
                 </ul>
              </div>
           </section>
        </div>

        {/* Main Feed Area */}
        <div className="xl:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatTile label="Processor" value={`${stats.cpuUsage}%`} icon={<Cpu size={14} />} />
              <StatTile label="Memory" value={`${stats.memoryUsage}%`} icon={<Database size={14} />} />
              <StatTile label="Battery" value={`${Math.floor(stats.batteryLevel)}%`} icon={<Battery size={14} />} />
           </div>

           <div className="bg-brand-panel border border-white/5 rounded-xl overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40">
                 <h2 className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-brand-cyan uppercase">
                    <Signal size={14} /> LIVE_SIGNAL_STREAM
                 </h2>
                 <div className="text-[10px] font-mono text-brand-muted uppercase tracking-tighter italic">[RECEIVING_2.4GHz]</div>
              </div>
              
              <div className="h-[350px] overflow-y-auto font-mono text-[11px]">
                 <AnimatePresence initial={false}>
                    {signals.map((signal) => (
                       <motion.div
                          key={signal.id}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="grid grid-cols-12 px-4 py-2.5 border-b border-white/5 items-center hover:bg-white/5 transition-colors gap-4"
                       >
                          <div className="col-span-2 text-brand-muted opacity-60">
                             {new Date(signal.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                             <span className={signal.type === 'WiFi' ? 'text-brand-cyan' : 'text-brand-green'}>[{signal.type}]</span>
                          </div>
                          <div className="col-span-5 truncate text-white">
                             <span className="font-bold">{signal.ssid || '<HIDDEN>'}</span>
                             <span className="ml-3 opacity-30 text-[9px]">{signal.mac}</span>
                          </div>
                          <div className="col-span-1 text-right font-bold text-brand-green">
                             {signal.rssi} dBm
                          </div>
                          <div className="col-span-2 text-right">
                             <span className="text-[9px] px-1.5 py-0.5 border border-brand-cyan/20 text-brand-cyan">SYNC_OK</span>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>

           {/* Console Log Aesthetic */}
           <div className="h-48 bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[11px] overflow-hidden flex flex-col backdrop-blur-sm">
              <div className="flex justify-between mb-2 text-brand-muted border-b border-white/5 pb-2">
                 <span className="uppercase tracking-tighter flex items-center gap-2"><Terminal size={12} /> Hardware Runtime Logs</span>
                 <span className="text-brand-cyan/50 italic animate-pulse">[LIVE_STREAM]</span>
              </div>
              <div className="flex-1 space-y-1 text-slate-400 overflow-y-auto">
                 <LogLine time="22:30:01" prefix="ESP32-S3" msg="Scanned 12 APs in 140ms. Radio optimized." color="text-brand-green" />
                 <LogLine time="22:30:05" prefix="GPS" msg="Lock confirmed. Vertical Accuracy: 1.2m" color="text-brand-green" />
                 <LogLine time="22:30:09" prefix="DB" msg="Committed 4.2kb session block to Firestore." color="text-brand-cyan" />
                 <LogLine time="22:30:12" prefix="PWR" msg="Low power mode active. Scaling clock to 160MHz." color="text-brand-amber" />
                 <LogLine time="22:30:15" prefix="SCAN" msg="Waiting for next dwell period (3sec)..." color="text-brand-muted" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const DisplayStat: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-baseline border-b border-white/5 pb-2 last:border-0">
    <span className="text-sm font-medium">{label}</span>
    <span className={`text-2xl font-mono ${color}`}>{value}</span>
  </div>
);

const StatTile: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-brand-panel border border-white/5 p-4 rounded-xl flex items-center justify-between">
    <div>
       <div className="text-[10px] font-mono text-brand-muted uppercase tracking-widest flex items-center gap-1">
         {icon} {label}
       </div>
       <div className="text-xl font-mono text-white font-bold">{value}</div>
    </div>
  </div>
);

const LogLine: React.FC<{ time: string; prefix: string; msg: string; color: string }> = ({ time, prefix, msg, color }) => (
  <p className="flex gap-2">
    <span className="text-brand-green">[{time}]</span>
    <span className="text-white italic">{prefix}:</span>
    <span className={`${color} opacity-90`}>{msg}</span>
  </p>
);
