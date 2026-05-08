import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, Map, Database, Settings, Shield, Zap, Satellite, Battery, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-screen bg-brand-bg text-brand-ink font-sans overflow-hidden selection:bg-brand-cyan/30 relative">
      <div className="scanline" />
      <div className="absolute inset-0 atmospheric-glow opacity-50 pointer-events-none" />
      
      {/* Header Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-brand-cyan flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter text-white uppercase">Wardrive <span className="text-brand-cyan">Pro</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-brand-muted font-mono leading-none">Operational Runtime Terminal</p>
          </div>
        </div>

        <div className="hidden md:flex gap-8 text-[11px] font-mono tracking-widest uppercase">
          <HeaderMetric label="Satellite Lock" value="34.0522° N, 118.2437° W" color="text-brand-cyan glow" icon={<Satellite size={10} />} />
          <HeaderMetric label="Power Draw" value="0.84W (Efficient)" color="text-brand-green" icon={<Battery size={10} />} />
          <HeaderMetric label="Storage" value="4.2GB / 32GB" color="text-brand-amber" icon={<HardDrive size={10} />} />
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-16 md:w-64 border-r border-white/5 p-4 md:p-6 bg-black/20 flex flex-col gap-8 z-10">
          <div className="flex flex-col gap-2">
            <h3 className="hidden md:block text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Systems</h3>
            <MenuLink to="/" icon={<Activity size={18} />} label="Dashboard" />
            <MenuLink to="/explorer" icon={<Map size={18} />} label="Explorer" />
            <MenuLink to="/security" icon={<Shield size={18} />} label="Security" />
            <MenuLink to="/database" icon={<Database size={18} />} label="Database" />
          </div>

          <div className="mt-auto space-y-4">
             <MenuLink to="/settings" icon={<Settings size={18} />} label="Settings" />
             <button className="w-full py-3 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-[11px] font-bold uppercase tracking-widest hover:bg-brand-cyan/20 transition-all rounded hidden md:block">
               Export CSV/KML
             </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-auto p-6 relative">
          {children}
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="px-6 py-2 border-t border-white/5 bg-black text-[9px] font-mono flex justify-between uppercase tracking-widest text-brand-muted z-50">
        <div className="flex gap-4">
           <span>Arch: ESP32-S3-WROOM</span>
           <span className="hidden sm:inline">Kernel: FreeRTOS V10.4.3</span>
        </div>
        <div className="flex gap-4">
          <span>Session: <span className="text-white/60">SESS_2026_ALPHA</span></span>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_5px_var(--color-brand-cyan)]" />
             <span className="text-brand-cyan">Link Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HeaderMetric: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="flex flex-col items-end">
    <span className="text-brand-muted flex items-center gap-1">{icon} {label}</span>
    <span className={`${color}`}>{value}</span>
  </div>
);

const MenuLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 border border-transparent
      ${isActive 
        ? 'bg-brand-cyan/10 border-brand-cyan/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
        : 'text-brand-muted hover:text-white hover:bg-white/5'}
    `}
  >
    {icon}
    <span className="hidden md:block text-[11px] font-bold uppercase tracking-widest">{label}</span>
  </NavLink>
);
