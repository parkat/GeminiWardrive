import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Security: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <div className="flex items-center gap-4 border-b border-brand-muted/20 pb-6">
        <div className="p-4 bg-brand-cyan/10 rounded-2xl border border-brand-cyan/20">
          <Shield className="text-brand-cyan" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tighter">SEC_PROTOCOL_V4</h1>
          <p className="text-brand-muted font-mono text-xs uppercase tracking-widest">Active defenses and encryption status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SecurityCard 
          title="Field Encryption" 
          status="ACTIVE" 
          desc="AES-256-GCM enforced on all PII fields (MAC, SSID) during transit and rest." 
          icon={<Lock size={20} />} 
          variant="success" 
        />
        <SecurityCard 
          title="Session Isolation" 
          status="ENFORCED" 
          desc="Master Gate Relational Sync prevents cross-tenant data leakage." 
          icon={<Eye size={20} />} 
          variant="success" 
        />
        <SecurityCard 
          title="Hardware Integrity" 
          status="VERIFIED" 
          desc="Firmware signature match confirmed (Build: 0x88FF)." 
          icon={<CheckCircle size={20} />} 
          variant="success" 
        />
        <SecurityCard 
          title="Anomalies" 
          status="NONE" 
          desc="No suspicious RF signatures detected in current proximity." 
          icon={<AlertTriangle size={20} />} 
          variant="info" 
        />
      </div>

      <div className="bg-black/40 border border-brand-muted/20 rounded-xl p-6 font-mono text-xs space-y-4">
        <h3 className="text-brand-cyan font-bold uppercase tracking-widest">FIREWALL_LOGS</h3>
        <div className="space-y-2 opacity-60">
          <p className="flex gap-4"><span>[22:25:01]</span> <span className="text-brand-green">BLOCK_INBOUND: ICMP_ECHO_REQUEST from 192.168.1.45</span></p>
          <p className="flex gap-4"><span>[22:25:12]</span> <span className="text-brand-cyan">DHCP_RENEWAL: SUCCESS [LEASE_6H]</span></p>
          <p className="flex gap-4"><span>[22:26:05]</span> <span className="text-brand-green">VPN_TUNNEL: ESTABLISHED [TUN0]</span></p>
          <p className="flex gap-4"><span>[22:27:10]</span> <span className="text-brand-muted">INTEGRITY_CHECK: PASS [CHECKSUM: 0xDEADBEEF]</span></p>
        </div>
      </div>
    </div>
  );
};

const SecurityCard: React.FC<{ title: string; status: string; desc: string; icon: React.ReactNode; variant: 'success' | 'info' | 'warning' }> = ({ title, status, desc, icon, variant }) => {
  const colorClass = {
    success: 'text-brand-green border-brand-green/20 bg-brand-green/5',
    info: 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5',
    warning: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'
  }[variant];

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-6 border rounded-xl space-y-4 ${colorClass} transition-colors`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-mono font-bold uppercase tracking-tighter">{title}</h3>
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest">{status}</span>
      </div>
      <p className="text-xs font-mono text-brand-ink leading-relaxed opacity-80">{desc}</p>
    </motion.div>
  );
};
