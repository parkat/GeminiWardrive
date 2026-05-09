import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Info, Layers, List, MapPin as MapPinIcon, ShieldAlert, Cpu, Zap } from 'lucide-react';
import { SignalPoint } from '../types';

// Simplified map placeholder for immersive view
const MapPlaceholder = () => (
   <div className="w-full h-full bg-[#050505] relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
         backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
         backgroundSize: '20px 20px'
      }} />
      
      {/* Mock Map Visual */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
           <path d="M10 10 Q 50 10 90 90" stroke="#0ea5e9" strokeWidth="0.5" fill="none" strokeDasharray="2 2"/>
           <circle cx="20" cy="20" r="2" fill="#0ea5e9" className="animate-pulse shadow-[0_0_10px_#0ea5e9]"/>
           <circle cx="45" cy="35" r="1.5" fill="#f59e0b" />
           <circle cx="70" cy="65" r="1.5" fill="#ef4444" />
           <circle cx="30" cy="80" r="2" fill="#0ea5e9" />
        </svg>
      </div>

      <div className="text-center space-y-4 z-10 p-12 max-w-md bg-black/60 border border-white/5 backdrop-blur-xl rounded-2xl shadow-2xl">
         <div className="w-16 h-16 bg-brand-cyan/20 flex items-center justify-center rounded-full mx-auto">
            <Layers className="text-brand-cyan" size={32} />
         </div>
         <h3 className="font-mono text-brand-cyan font-bold uppercase tracking-[0.2em]">Map Terminal</h3>
         <p className="text-[10px] font-mono text-brand-muted leading-relaxed uppercase">
            Awaiting Hardware Bridge...<br/>
            No Active GPS Telemetry Detected
         </p>
      </div>
      
      <div className="absolute bottom-4 left-4 flex gap-2">
        <div className="bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-mono text-brand-cyan">
          ZOOM: 18.5x
        </div>
        <div className="bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-mono text-brand-muted">
          SENSORS: ACTIVE
        </div>
      </div>
   </div>
);

export const Explorer: React.FC = () => {
  const [nodes, setNodes] = useState<SignalPoint[]>([]);
  const [selectedNode, setSelectedNode] = useState<SignalPoint | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/mock-signals')
      .then(res => res.json())
      .then(data => {
         setNodes(data);
         if (data.length > 0) setSelectedNode(data[0]);
      });
  }, []);

  const filteredNodes = nodes.filter(n => 
    n.ssid?.toLowerCase().includes(search.toLowerCase()) || 
    n.mac.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
         
         {/* Map Window */}
         <div className="flex-1 bg-brand-panel border border-white/5 rounded-xl overflow-hidden shadow-2xl relative min-h-[400px]">
            <div className="absolute top-4 left-4 z-20 flex gap-4">
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                  <input 
                     type="text" 
                     placeholder="FILTER_NODES..."
                     className="w-full bg-black/60 border border-white/10 pl-9 pr-4 py-1.5 rounded font-mono text-[10px] focus:border-brand-cyan outline-none text-white backdrop-blur"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
            </div>
            <MapPlaceholder />
         </div>

         {/* Right Sidebar: Node Details */}
         <aside className="w-full lg:w-80 flex flex-col gap-6 overflow-hidden">
            
            {/* Detail Card */}
            <div className="bg-brand-panel p-6 border border-white/5 rounded-xl backdrop-blur-md">
               <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-6">Last Node Detail</h3>
               
               {selectedNode ? (
                  <div className="space-y-6">
                     <div className="bg-brand-cyan/5 p-4 rounded-lg border border-brand-cyan/20">
                        <div className="text-[10px] text-brand-cyan mb-1 font-mono uppercase tracking-widest">SSID</div>
                        <div className="text-xl font-bold text-white mb-4 tracking-tighter uppercase truncate">
                           {selectedNode.ssid || '<HIDDEN_NETWORK>'}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                           <DetailItem label="BSSID" value={selectedNode.mac} />
                           <DetailItem label="Signal" value={`${selectedNode.rssi} dBm`} color="text-brand-green" />
                           <DetailItem label="Manufacturer" value={selectedNode.manufacturer || 'PENDING_ENRICHMENT'} />
                           <DetailItem label="Security" value={selectedNode.security || 'WPA2/AES'} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <ActionButton 
                           icon={<Zap size={12} />} 
                           label="Enrich Metadata" 
                           onClick={() => {
                              const macs = nodes.filter(n => !n.manufacturer).map(n => n.mac);
                              if (macs.length > 0) {
                                 fetch('/api/enrich', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ macs })
                                 }).then(() => {
                                    fetch('/api/mock-signals')
                                       .then(res => res.json())
                                       .then(data => setNodes(data));
                                 });
                              }
                           }}
                        />
                        <ActionButton 
                           icon={<Download size={12} />} 
                           label="Export for LLM" 
                           onClick={() => {
                              window.location.href = '/api/export-llm';
                           }}
                        />
                        <ActionButton icon={<MapPinIcon size={12} />} label="Trace Route" />
                        <ActionButton icon={<ShieldAlert size={12} />} label="Audit Vulnerabilities" />
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-12 opacity-30 font-mono text-[10px]">SELECT_NODE_FOR_TELEMETRY</div>
               )}
            </div>

            {/* List Feed */}
            <div className="flex-1 bg-brand-panel border border-white/5 rounded-xl flex flex-col overflow-hidden backdrop-blur-md">
               <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20 text-[10px] font-mono font-bold uppercase tracking-widest">
                  <span>Data Grid</span>
                  <span className="text-brand-muted italic">{filteredNodes.length} NODES</span>
               </div>
               <div className="flex-1 overflow-auto divide-y divide-white/5">
                  {filteredNodes.map((node) => (
                     <div 
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 hover:bg-white/5 transition-colors cursor-pointer group ${selectedNode?.id === node.id ? 'bg-brand-cyan/5 border-l-2 border-brand-cyan' : ''}`}
                     >
                        <div className="flex items-center justify-between mb-1">
                           <span className="font-mono text-[11px] font-bold truncate pr-2 group-hover:text-brand-cyan transition-colors">{node.ssid || '<HIDDEN>'}</span>
                           <span className={`text-[9px] font-mono font-bold ${node.type === 'WiFi' ? 'text-brand-cyan' : 'text-brand-green'}`}>[{node.type}]</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-brand-muted">
                           <span className="opacity-40">{node.mac}</span>
                           <span>{node.rssi}dBm</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-white" }) => (
   <div>
      <span className="block text-brand-muted uppercase text-[8px] tracking-widest">{label}</span>
      <span className={`${color} break-all`}>{value}</span>
   </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
   <button 
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/10 hover:text-white transition-all"
   >
      {icon} {label}
   </button>
);
