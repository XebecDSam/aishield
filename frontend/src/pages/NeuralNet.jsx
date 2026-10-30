import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Brain, Network, Zap, Volume2, VolumeX, Pause, Play, 
  Sliders, ShieldCheck, AlertTriangle, Download, RefreshCw, Cpu, Activity
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

    if (type === 'anomaly') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio restricted
  }
};

export default function NeuralNet() {
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sensitivity, setSensitivity] = useState(0.85); // 0.70 to 0.95
  const [activeDimension, setActiveDimension] = useState('all'); // 'all', 'keystroke', 'net_burst', 'syscalls'
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [anomaliesDetected, setAnomaliesDetected] = useState(7);

  useEffect(() => {
    // Generate 32 interactive nodes in a simulated deep layer topology
    const initialNodes = Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      x: 15 + (i % 6) * 14 + (Math.random() * 6 - 3),
      y: 15 + Math.floor(i / 6) * 16 + (Math.random() * 6 - 3),
      layer: Math.floor(i / 6),
      active: false,
      threat: false,
      activation: 0.1
    }));
    setNodes(initialNodes);

    const interval = setInterval(() => {
      if (isPaused) return;

      const triggerThreat = Math.random() > sensitivity;
      setNodes(prev => prev.map(n => ({
        ...n,
        active: Math.random() > 0.4,
        threat: triggerThreat && Math.random() > 0.85,
        activation: Number(Math.random().toFixed(2))
      })));

      if (triggerThreat) {
        playCyberSound('anomaly', soundEnabled);
        setAnomaliesDetected(c => c + 1);
        const vectors = ['Unusual Token Entropy in Kerberos Ticket', 'Out-of-order Kernel Syscall Burst', 'Lateral Memory Read (LSASS probe)', 'Off-hours High-Volume API exfiltration'];
        const chosen = vectors[Math.floor(Math.random() * vectors.length)];
        setLogs(prev => [
          `[AI-ANOMALY] Confidence ${(0.88 + Math.random() * 0.11).toFixed(2)}: ${chosen}`,
          ...prev
        ].slice(0, 20));
      } else if (Math.random() > 0.6) {
        setLogs(prev => [
          `[INFERENCE] Behavioral vector nominal across 128 latent dimensions`,
          ...prev
        ].slice(0, 20));
      }
    }, 1400);

    return () => clearInterval(interval);
  }, [isPaused, sensitivity, soundEnabled]);

  const injectSyntheticAnomaly = () => {
    playCyberSound('anomaly', soundEnabled);
    setAnomaliesDetected(c => c + 1);
    setNodes(prev => prev.map((n, i) => i % 3 === 0 ? { ...n, active: true, threat: true } : n));
    setLogs(prev => [
      `[MANUAL-ADVERSARIAL] Synthetic adversarial perturbation injected. Neural loss spiked to 0.089. Anomaly quarantined!`,
      ...prev
    ]);
    setAnnouncement('Injected synthetic adversarial anomaly into neural weights');
  };

  const handleExport = () => {
    const report = {
      model_metadata: {
        architecture: 'Deep Variational Autoencoder (VAE-4.2)',
        latent_space: 128,
        sensitivity_threshold: sensitivity,
        total_anomalies: anomaliesDetected
      },
      inference_trail: logs
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeuralNet_Inference_Report_${Date.now()}.json`;
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
            <Brain className="text-purple-500 animate-pulse" size={30} /> Neural Behavior Analysis
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            Deep Variational Autoencoder (VAE) Anomaly Detection & Latent Feature Analysis
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
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            title={soundEnabled ? 'Mute' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-purple-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-purple-300 border border-white/10"
          >
            <Download size={13} /> Export Model Log
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Top Hyperparameters HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4 font-mono text-xs">
        <div className="bento-card p-3 bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px]">Architecture</span>
          <div className="text-white font-bold text-sm">Deep VAE-4.2</div>
        </div>
        <div className="bento-card p-3 bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px]">Latent Dimensions</span>
          <div className="text-purple-400 font-bold text-sm">128 Hidden</div>
        </div>
        <div className="bento-card p-3 bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px]">Inference Latency</span>
          <div className="text-emerald-400 font-bold text-sm">1.18 ms</div>
        </div>
        <div className="bento-card p-3 bg-black/40 border border-white/5">
          <span className="text-gray-400 text-[10px]">Reconstruction Loss</span>
          <div className="text-cyan-400 font-bold text-sm">MSE: 0.0014</div>
        </div>
        <div className="bento-card p-3 bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-gray-400 text-[10px]">Anomalies Isolated</span>
          <div className="text-rose-400 font-bold text-sm">{anomaliesDetected} Events</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden">
        
        {/* LEFT NEURAL TOPOLOGY VISUALIZER */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-[2] bento-card relative bg-black/70 overflow-hidden flex flex-col p-5 justify-between">
          <div className="flex justify-between items-center z-10 font-mono text-xs">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Network size={16} /> NEURAL SYNAPSE TOPOLOGY
            </div>
            <button
              type="button"
              onClick={injectSyntheticAnomaly}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              <Zap size={13} /> Inject Synthetic Anomaly
            </button>
          </div>

          {/* Canvas Neural Mesh */}
          <div className="relative flex-1 my-4 overflow-hidden rounded-xl border border-white/5 bg-black/40">
            {/* SVG Synapse Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
              {nodes.map((n, i) => {
                const nextNode = nodes[(i + 5) % nodes.length];
                return (
                  <line 
                    key={i} 
                    x1={`${n.x}%`} 
                    y1={`${n.y}%`} 
                    x2={`${nextNode.x}%`} 
                    y2={`${nextNode.y}%`} 
                    stroke={n.threat ? '#f43f5e' : '#a855f7'} 
                    strokeWidth={n.active ? 1.5 : 0.75} 
                  />
                );
              })}
            </svg>

            {/* Neural Nodes */}
            {nodes.map(node => (
              <motion.div
                key={node.id}
                animate={isPaused ? {} : {
                  scale: node.threat ? [1, 2.2, 1] : node.active ? [1, 1.3, 1] : 1,
                  opacity: node.threat ? 1 : node.active ? 0.9 : 0.35
                }}
                transition={{ duration: 1.2, repeat: node.threat ? Infinity : 0 }}
                className={`absolute w-3 h-3 rounded-full ${
                  node.threat 
                    ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e]' 
                    : node.active 
                    ? 'bg-purple-400 shadow-[0_0_12px_#c084fc]' 
                    : 'bg-purple-900/60'
                }`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              />
            ))}
          </div>

          {/* Bottom Sensitivity Tuning Slider */}
          <div className="z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-3 font-mono text-xs">
            <div className="flex items-center gap-3 flex-1 min-w-[220px]">
              <span className="text-gray-400">Anomaly Sensitivity:</span>
              <input
                type="range"
                min="0.70"
                max="0.95"
                step="0.05"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="flex-1 accent-purple-500 cursor-pointer"
              />
              <strong className="text-purple-400">{(1 - sensitivity).toFixed(2)} σ</strong>
            </div>

            <div className="text-[11px] text-gray-500">
              * Adaptive self-healing weights auto-tune every 5 seconds
            </div>
          </div>
        </motion.div>

        {/* RIGHT LIVE INFERENCE LOG */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bento-card flex flex-col p-0 bg-black/60 overflow-hidden">
          <div className="p-4 bg-purple-950/30 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-purple-400" size={17} />
              <h3 className="font-bold text-purple-100 uppercase tracking-widest text-xs sm:text-sm">
                Inference Stream & Root Cause
              </h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {logs.length} Predictions
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs custom-scrollbar">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`p-2 rounded border ${
                  log.includes('ANOMALY') || log.includes('ADVERSARIAL') 
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 font-bold' 
                    : 'bg-white/5 border-white/5 text-gray-400'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
