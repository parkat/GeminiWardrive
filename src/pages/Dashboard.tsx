import React from 'react';
import { useSignals } from '../hooks/useSignals';
import { Cpu, Database, Battery, MapPin, Signal, Wifi, Bluetooth, Radio, Terminal, Zap, Satellite, Trash2, Cpu as Chip, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { signals, stats } = useSignals();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Sidebar Status (Left) */}
        <div className="space-y-6 hidden xl:block">
           <section className="bg-brand-panel border border-white/5 rounded-xl p-5 backdrop-blur-md">
              <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Chip size={14} /> Hardware Link
              </h3>
              <div className="space-y-4">
                 <HardwareRow label="RTL-SDR" status={stats.sdr.status} />
                 <HardwareRow label="Alfa WiFi" status={stats.alfa.status} />
                 <HardwareRow label="ESP32 (BLE)" status={stats.esp32.status} />
                 <HardwareRow label="USB GPS" status={stats.gps.status} />
              </div>
           </section>

           <section className="bg-brand-panel border border-white/5 rounded-xl p-5 backdrop-blur-md">
              <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4">Signal Density</h3>
              <div className="space-y-4">
                 <DisplayStat label="Access Points" value={signals.filter(s => s.type === 'WiFi').length} />
                 <DisplayStat label="BT/BLE Nodes" value={signals.filter(s => s.type === 'Bluetooth').length} color="text-brand-cyan" />
              </div>
           </section>

           <section className="bg-brand-panel border border-white/5 rounded-xl p-5 backdrop-blur-md">
              <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Database size={14} /> Intelligence Cache
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-brand-muted">Total Records:</span>
                  <span className="text-white">{signals.length}</span>
                </div>
                <button 
                  onClick={() => {
                    if(confirm("DANGER: This will permanently wipe all captured signal data from your local device. Proceed?")) {
                      fetch('/api/purge', { method: 'POST' }).then(() => window.location.reload());
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-red/10 border border-brand-red/30 text-brand-red text-[10px] font-bold uppercase tracking-widest hover:bg-brand-red/20 transition-all rounded"
                >
                  <Trash2 size={12} /> Purge Database
                </button>
              </div>
           </section>
        </div>

        {/* Main Feed Area */}
        <div className="xl:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatTile label="Pos Lock" value={stats.gps.status === 'LOCKED' ? 'VALID' : 'NO_FIX'} icon={<Satellite size={14} />} color={stats.gps.status === 'LOCKED' ? 'text-brand-green' : 'text-brand-red'} />
              <StatTile label="Capture Buffer" value={`${signals.length}/500`} icon={<Activity size={14} />} color="text-brand-cyan" />
              <StatTile label="Session Time" value={`${Math.floor(stats.uptime / 60)}m`} icon={<Terminal size={14} />} color="text-white" />
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
                 <span className="text-brand-cyan/50 italic animate-pulse">[{signals.length > 0 ? 'LIVE_STREAMING' : 'IDLE'}]</span>
              </div>
              <div className="flex-1 space-y-1 text-slate-400 overflow-y-auto">
                 {signals.length > 0 ? (
                    signals.slice(0, 10).map((s, i) => (
                       <LogLine 
                          key={s.id} 
                          time={new Date(s.timestamp).toLocaleTimeString([], { hour12: false })} 
                          prefix={s.type} 
                          msg={`Discovery: ${s.ssid || 'Unknown'} (${s.rssi}dBm)`} 
                          color={s.type === 'WiFi' ? 'text-brand-cyan' : 'text-brand-green'} 
                       />
                    ))
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                       <Radio className="mb-2 animate-pulse" size={24} />
                       <p>WAITING FOR HARDWARE BRIDGE...</p>
                       <p className="text-[9px]">Ensure local agent is running and pushing to /api/signals</p>
                    </div>
                 )}
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

const HardwareRow: React.FC<{ label: string; status: string }> = ({ label, status }) => {
  const isOnline = status === 'ACTIVE' || status === 'LOCKED' || status === 'CONNECTED';
  const color = isOnline ? 'text-brand-green' : status === 'ERROR' ? 'text-brand-red' : 'text-brand-muted';
  
  return (
    <div className="flex justify-between items-center text-[11px] font-mono">
      <span className="text-brand-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`${color} font-bold`}>{status}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-brand-green shadow-[0_0_5px_#34d399]' : 'bg-brand-muted opacity-30'}`} />
      </div>
    </div>
  );
};

const StatTile: React.FC<{ label: string; value: string; icon: React.ReactNode; color?: string }> = ({ label, value, icon, color = "text-white" }) => (
  <div className="bg-brand-panel border border-white/5 p-4 rounded-xl flex items-center justify-between">
    <div>
       <div className="text-[10px] font-mono text-brand-muted uppercase tracking-widest flex items-center gap-1">
         {icon} {label}
       </div>
       <div className={`text-xl font-mono font-bold ${color}`}>{value}</div>
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
