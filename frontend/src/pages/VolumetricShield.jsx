import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Wifi, Terminal, X, Search, Volume2, VolumeX, 
  Pause, Play, Download, Sliders, ShieldAlert, ShieldCheck, Zap, 
  Activity, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const playCyberSound = (type = 'click', enabled = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'scrub') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio restricted
  }
};

export default function VolumetricShield() {
  const [packets, setPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [scrubLevel, setScrubLevel] = useState('HIGH'); // 'LOW', 'MEDIUM', 'HIGH', 'UNDER_ATTACK'
  const [dropUdp, setDropUdp] = useState(true);
  const [dropIcmp, setDropIcmp] = useState(true);
  const [synCookies, setSynCookies] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const protocols = ['SYN Flood', 'UDP Amp', 'ICMP Smurf', 'HTTP Slowloris', 'DNS Amplification', 'NTP Monlist'];
    
    const interval = setInterval(() => {
      if (isPaused) return;

      const newPackets = Array.from({ length: Math.floor(Math.random() * 4) + 2 }).map(() => {
        const proto = protocols[Math.floor(Math.random() * protocols.length)];
        const isBlocked = scrubLevel === 'UNDER_ATTACK' ? true :
                          scrubLevel === 'HIGH' ? Math.random() > 0.15 :
                          scrubLevel === 'MEDIUM' ? Math.random() > 0.35 : Math.random() > 0.6;
        return {
          id: Math.random().toString(36).substr(2, 9),
          ip: `${Math.floor(Math.random()*210)+10}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
          size: Math.floor(Math.random() * 1420) + 64,
          type: proto,
          blocked: isBlocked,
          ttl: Math.floor(Math.random() * 64) + 60,
          port: [443, 80, 53, 123, 8080][Math.floor(Math.random() * 5)],
          hexDump: Array.from({length: 8}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0')).join(' '),
          time: new Date().toLocaleTimeString()
        };
      });

      setPackets(prev => {
        playCyberSound('scrub', soundEnabled);
        return [...newPackets, ...prev].slice(0, 40);
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isPaused, scrubLevel, soundEnabled]);

  const trafficGbps = (packets.length * 48.6).toFixed(1);

  const handleExport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      mitigation_level: scrubLevel,
      current_volume_gbps: trafficGbps,
      packets_inspected: packets
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Volumetric_Shield_DDoS_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click', soundEnabled);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 max-w-[1550px] mx-auto font-sans flex flex-col h-screen overflow-hidden text-slate-100 ${highContrast ? 'contrast-125' : ''}`}>
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* Header */}
      <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Shield className="text-cyan-500 animate-pulse" size={30} /> Volumetric DDoS Shield
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            BGP Anycast Scrubbing Farm & Deep Layer-3/4/7 Packet Inspection
          </p>
        </motion.div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 border border-white/10"
          >
            {isPaused ? <Play size={13} className="text-emerald-400" /> : <Pause size={13} className="text-amber-400" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE ANIM'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            title={soundEnabled ? 'Mute' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-cyan-400 border border-white/10"
          >
            <Download size={13} /> Export Stream
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden">
        
        {/* LEFT SHIELD GENERATOR & MITIGATION ENGINE */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-[1.8] bento-card relative bg-black/70 overflow-hidden flex flex-col p-6 justify-between">
          
          {/* Top HUD Stats */}
          <div className="flex justify-between items-center z-10 font-mono text-xs text-gray-400">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{trafficGbps} Gbps</div>
              <div className="text-[10px] text-gray-400">TOTAL INBOUND PEAK SCRUBBED</div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                scrubLevel === 'UNDER_ATTACK' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                SHIELD: {scrubLevel}
              </span>
            </div>
          </div>

          {/* Central Shield Hologram */}
          <div className="relative flex-1 flex items-center justify-center my-6 overflow-hidden">
            <div className="relative z-10 w-44 h-44 rounded-full border-4 border-cyan-500 flex items-center justify-center shadow-[0_0_80px_rgba(6,182,212,0.6)] bg-cyan-950/40 backdrop-blur-md">
              <Shield size={60} className="text-cyan-400" />
              {!isPaused && (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }} 
                  className="absolute inset-[-18px] rounded-full border-2 border-dashed border-cyan-400/50" 
                />
              )}
            </div>

            {/* Flying Packet Trajectories */}
            {!isPaused && (
              <AnimatePresence>
                {packets.slice(0, 10).map((p, i) => {
                  const angle = (i * 36) * (Math.PI / 180);
                  const startX = Math.cos(angle) * 220;
                  const startY = Math.sin(angle) * 220;

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ x: startX, y: startY, opacity: 1, scale: 1 }}
                      animate={{ x: 0, y: 0, opacity: 0, scale: 2 }}
                      transition={{ duration: 0.9, ease: "easeIn" }}
                      className={`absolute w-3 h-1.5 rounded-full pointer-events-none ${
                        p.blocked ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-cyan-400'
                      }`}
                    />
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Bottom Defense Tuning Controls */}
          <div className="z-10 space-y-3 border-t border-white/10 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-gray-400">Scrubbing Policy:</span>
              <div className="flex gap-1.5 text-[11px] font-mono">
                {['LOW', 'MEDIUM', 'HIGH', 'UNDER_ATTACK'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setScrubLevel(lvl);
                      playCyberSound('click', soundEnabled);
                    }}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      scrubLevel === lvl 
                        ? 'bg-cyan-600 text-white font-bold' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={dropUdp} onChange={e => setDropUdp(e.target.checked)} className="accent-cyan-500 rounded" />
                <span>Drop Inbound UDP Floods</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={dropIcmp} onChange={e => setDropIcmp(e.target.checked)} className="accent-cyan-500 rounded" />
                <span>Null-Route ICMP Smurf</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={synCookies} onChange={e => setSynCookies(e.target.checked)} className="accent-cyan-500 rounded" />
                <span>SYN Cookie Defense</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* RIGHT LIVE PACKET STREAM */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bento-card flex flex-col p-0 bg-black/60 overflow-hidden">
          <div className="p-4 bg-cyan-950/30 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="text-cyan-400" size={17} />
              <h3 className="font-bold text-cyan-100 uppercase tracking-widest text-xs sm:text-sm">
                Scrubbed Traffic (Click To Inspect)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {packets.length} Packets Logged
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {packets.map(p => (
              <div 
                key={p.id} 
                onClick={() => {
                  setSelectedPacket(p);
                  playCyberSound('click', soundEnabled);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  p.blocked 
                    ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50' 
                    : 'bg-cyan-950/20 border-cyan-500/20 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex justify-between items-center mb-1 text-xs font-mono">
                  <span className="text-white font-bold">{p.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    p.blocked ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {p.blocked ? 'DROPPED' : 'SCRUBBED'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-mono">
                  <span>Source: {p.ip}:{p.port}</span>
                  <span>{p.size} Bytes</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* PACKET FORENSIC & HEX DUMP MODAL */}
      <AnimatePresence>
        {selectedPacket && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.94 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="bg-[#040e11] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] font-mono text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Terminal size={18} /> Packet Header & Payload Hex
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPacket(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Packet ID:</span>
                  <span className="text-white font-bold">{selectedPacket.id}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Protocol Vector:</span>
                  <span className="text-cyan-300 font-bold">{selectedPacket.type}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Source Host:</span>
                  <span className="text-white">{selectedPacket.ip}:{selectedPacket.port}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Packet Length & TTL:</span>
                  <span className="text-white">{selectedPacket.size} Bytes (TTL: {selectedPacket.ttl})</span>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Raw Payload Hex Dump:</div>
                  <div className="bg-black/60 p-3 rounded-lg text-emerald-400 break-all select-all font-mono">
                    {selectedPacket.hexDump} 4a 6f 6c 74 20 44 44 6f 53
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    setSelectedPacket(null);
                    setAnnouncement(`Injected permanent drop rule for ${selectedPacket.ip}`);
                  }}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors"
                >
                  Permanently Drop IP CIDR
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPacket(null)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/15 text-gray-300 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
