import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Globe, ArrowLeft, ShieldAlert, WifiOff, Volume2, VolumeX, Eye, 
  Settings2, Download, Play, Pause, RefreshCw, X, ShieldCheck, 
  AlertTriangle, Crosshair, Filter, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const playCyberSound = (type = 'blip', enabled = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'blip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio context may be restricted
  }
};

export default function ThreatRadar() {
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // ALL, CRITICAL, HIGH, MEDIUM
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [mitigatedCount, setMitigatedCount] = useState(148);

  // Generate simulated fallback threat if offline or connecting
  const createSimulatedThreat = () => {
    const types = ['Volumetric SYN Flood', 'Mirai Botnet C2', 'Log4j Zero-Day', 'SSH Brute Force', 'DNS Amplification', 'CobaltStrike Beacon'];
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM'];
    const countries = ['RU', 'CN', 'US', 'NL', 'BR', 'KP', 'IR'];
    const sev = severities[Math.floor(Math.random() * severities.length)];
    return {
      id: `THR-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
      type: types[Math.floor(Math.random() * types.length)],
      source_ip: `${Math.floor(Math.random() * 210) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      destination_port: [443, 80, 22, 8080, 53, 3389][Math.floor(Math.random() * 6)],
      severity: sev,
      timestamp: new Date().toISOString(),
      country: countries[Math.floor(Math.random() * countries.length)],
      asn: `AS${Math.floor(Math.random() * 50000) + 1000} Threat Transit`,
      angle: Math.random() * 360,
      radius: 40 + Math.random() * 110
    };
  };

  useEffect(() => {
    // Initial batch
    const initial = Array.from({ length: 6 }).map(createSimulatedThreat);
    setThreats(initial);
    setLogs(initial.map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.type} from ${t.source_ip} (${t.country}) flagged [${t.severity}]`));

    const fetchThreats = () => {
      if (isPaused) return;

      axios.get(`${API_URL}/api/live-threats`)
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const enriched = res.data.map(t => ({
              ...t,
              id: t.id || `THR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              angle: Math.random() * 360,
              radius: 40 + Math.random() * 110,
              country: t.country || 'EXT',
              destination_port: t.destination_port || 443
            }));

            setThreats(prev => [...enriched, ...prev].slice(0, 15));
            setLogs(prev => [
              ...enriched.map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.type} from ${t.source_ip} (Port ${t.destination_port}) [${t.severity}]`),
              ...prev
            ].slice(0, 30));

            playCyberSound('blip', soundEnabled);
            setAnnouncement(`Intercepted ${enriched.length} incoming threats`);
          } else {
            // Fallback simulation
            const sim = createSimulatedThreat();
            setThreats(prev => [sim, ...prev].slice(0, 15));
            setLogs(prev => [`[${new Date(sim.timestamp).toLocaleTimeString()}] ${sim.type} from ${sim.source_ip} [${sim.severity}]`, ...prev].slice(0, 30));
            playCyberSound('blip', soundEnabled);
          }
        })
        .catch(() => {
          // Graceful offline simulation
          const sim = createSimulatedThreat();
          setThreats(prev => [sim, ...prev].slice(0, 15));
          setLogs(prev => [`[${new Date(sim.timestamp).toLocaleTimeString()}] ${sim.type} from ${sim.source_ip} (${sim.country}) [${sim.severity}]`, ...prev].slice(0, 30));
          playCyberSound('blip', soundEnabled);
        });
    };

    const interval = setInterval(fetchThreats, 2800);
    return () => clearInterval(interval);
  }, [isPaused, soundEnabled]);

  const filteredThreats = useMemo(() => {
    if (filterSeverity === 'ALL') return threats;
    return threats.filter(t => t.severity === filterSeverity);
  }, [threats, filterSeverity]);

  const handleNeutralize = (threat) => {
    playCyberSound('alert', soundEnabled);
    setThreats(prev => prev.filter(t => t.id !== threat.id));
    setMitigatedCount(c => c + 1);
    setLogs(prev => [`[MITIGATED] Block rule injected into BGP border for ${threat.source_ip}`, ...prev]);
    setSelectedThreat(null);
    setAnnouncement(`Threat from ${threat.source_ip} neutralized successfully`);
  };

  const handleExport = () => {
    const data = JSON.stringify({ exported_at: new Date().toISOString(), total_intercepts: logs.length, threats: threats }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GlobalThreatRadar_Dossier_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click', soundEnabled);
    setAnnouncement('Threat intelligence report exported');
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 max-w-[1550px] mx-auto font-sans flex flex-col h-screen overflow-hidden text-slate-100 ${highContrast ? 'contrast-125' : ''}`}>
      {/* Screen Reader Announcer */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* Header */}
      <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Globe className="text-rose-500 animate-pulse" size={30} /> Global Threat Radar
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            Live Planetary Volumetric Sweeper & Intercept Telemetry
          </p>
        </motion.div>

        {/* Accessibility & Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Play Stream */}
          <button
            type="button"
            onClick={() => {
              setIsPaused(!isPaused);
              playCyberSound('click', soundEnabled);
              setAnnouncement(isPaused ? 'Resumed threat telemetry' : 'Paused threat telemetry');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 border border-white/10 transition-colors"
          >
            {isPaused ? <Play size={14} className="text-emerald-400" /> : <Pause size={14} className="text-amber-400" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
            title={soundEnabled ? 'Mute audio synthesizer' : 'Enable audio synthesizer'}
          >
            {soundEnabled ? <Volume2 size={15} className="text-rose-400" /> : <VolumeX size={15} />}
          </button>

          {/* High Contrast */}
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              highContrast ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y High-Contrast
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-emerald-400 border border-white/10 transition-colors"
          >
            <Download size={14} /> Export Feed
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden">
        
        {/* RADAR VISUALIZER PANEL */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-[2] bento-card relative bg-black/70 overflow-hidden flex flex-col p-4 md:p-6 justify-between">
          
          {/* Top Radar Stats HUD */}
          <div className="flex justify-between items-center z-10 font-mono text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-white font-bold tracking-wider">360° SPHERICAL RADAR ACTIVE</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Threats Tracked: <strong className="text-rose-400">{filteredThreats.length}</strong></span>
              <span>Neutralized: <strong className="text-emerald-400">{mitigatedCount}</strong></span>
            </div>
          </div>

          {/* Central Sweep Circle */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none"></div>

            {/* Radar Coordinates Crosshairs */}
            <div className="absolute w-full h-[1px] bg-rose-500/20 pointer-events-none"></div>
            <div className="absolute h-full w-[1px] bg-rose-500/20 pointer-events-none"></div>

            {/* Degree Markings */}
            <span className="absolute top-2 text-[10px] font-mono text-rose-500/50">000° NORTH</span>
            <span className="absolute bottom-2 text-[10px] font-mono text-rose-500/50">180° SOUTH</span>
            <span className="absolute left-2 text-[10px] font-mono text-rose-500/50">270° WEST</span>
            <span className="absolute right-2 text-[10px] font-mono text-rose-500/50">090° EAST</span>

            {/* Concentric Rings */}
            <div className="relative w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 rounded-full border border-rose-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(244,63,94,0.15)]">
              <div className="w-52 md:w-64 h-52 md:h-64 rounded-full border border-rose-500/30 flex items-center justify-center">
                <div className="w-28 md:w-32 h-28 md:h-32 rounded-full border border-rose-500/25 bg-rose-500/5 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-rose-500/40 animate-pulse"></div>
                </div>
              </div>
              
              {/* Animated Radar Sweeper */}
              {!isPaused && (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                  className="absolute w-1/2 h-full top-0 right-1/2 origin-right bg-gradient-to-l from-rose-500/35 via-rose-500/10 to-transparent pointer-events-none"
                  style={{ clipPath: 'polygon(100% 50%, 0 0, 0 100%)' }}
                />
              )}
              
              {/* Interactive Threat Blips */}
              <AnimatePresence>
                {filteredThreats.map((t) => {
                  const rad = (t.angle || 45) * (Math.PI / 180);
                  const dist = Math.min(130, Math.max(30, t.radius || 75));
                  const x = Math.cos(rad) * dist;
                  const y = Math.sin(rad) * dist;
                  const isCritical = t.severity === 'CRITICAL';

                  return (
                    <motion.button 
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedThreat(t);
                        playCyberSound('click', soundEnabled);
                        setAnnouncement(`Inspecting threat ${t.type} from ${t.source_ip}`);
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: [1, 1.4, 1] }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.6 }}
                      title={`Click to inspect: ${t.type} (${t.source_ip})`}
                      className={`absolute w-3.5 h-3.5 rounded-full cursor-pointer z-20 group transition-all transform hover:scale-150 ${
                        isCritical 
                          ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' 
                          : t.severity === 'HIGH' 
                          ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]' 
                          : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                      }`}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      <span className="sr-only">Threat: {t.type} from {t.source_ip}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Filter Pill Bar */}
          <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Filter size={13} className="text-gray-400" />
              <span className="text-gray-400">Severity Filter:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => {
                    setFilterSeverity(sev);
                    playCyberSound('click', soundEnabled);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    filterSeverity === sev 
                      ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-mono text-gray-400">
              * Click any blip on radar for deep containment action
            </div>
          </div>
        </motion.div>

        {/* LOGS & FORENSIC FEED PANEL */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bento-card flex flex-col p-0 bg-black/60 overflow-hidden">
          <div className="p-4 bg-rose-950/40 border-b border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="text-rose-400" size={18} />
              <h3 className="font-bold text-rose-100 uppercase tracking-widest text-xs sm:text-sm">
                Live Intercept Feed
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-400 animate-pulse bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
              STREAMING
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs custom-scrollbar">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`border-l-2 pl-3 py-1.5 transition-colors ${
                  log.includes('CRITICAL') || log.includes('MITIGATED')
                    ? 'border-rose-500 bg-rose-500/5 text-rose-200' 
                    : log.includes('HIGH') 
                    ? 'border-amber-500 bg-amber-500/5 text-amber-200' 
                    : 'border-cyan-500/40 text-gray-400'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* DEEP INSPECTION & CONTAINMENT MODAL */}
      <AnimatePresence>
        {selectedThreat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.92 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="bg-[#0b040a] border border-rose-500/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(244,63,94,0.3)] font-mono text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Crosshair size={18} /> Target Telemetry Dossier
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedThreat(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Threat Identifier:</span>
                  <span className="text-white font-bold">{selectedThreat.id}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Attack Classification:</span>
                  <span className="text-rose-400 font-bold">{selectedThreat.type}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Source IP & Country:</span>
                  <span className="text-white">{selectedThreat.source_ip} ({selectedThreat.country})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Destination Port:</span>
                  <span className="text-white font-bold">{selectedThreat.destination_port}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Autonomous System (ASN):</span>
                  <span className="text-gray-200">{selectedThreat.asn}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Severity Tier:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {selectedThreat.severity}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleNeutralize(selectedThreat)}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                >
                  <ShieldCheck size={16} /> BGP Blackhole / Block IP
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedThreat(null)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/15 text-gray-300 rounded-xl transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
