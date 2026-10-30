import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Flame, ShieldAlert, Crosshair, Database, ShieldCheck, 
  Volume2, VolumeX, Pause, Play, Download, X, Layers, AlertTriangle, 
  Zap, Scissors, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  { id: 0, name: "Reconnaissance", desc: "Target harvesting & port scans", mitre: "T1595" },
  { id: 1, name: "Weaponization", desc: "Payload & exploit coupling", mitre: "T1587" },
  { id: 2, name: "Delivery", desc: "Spear-phishing & drive-by drops", mitre: "T1566" },
  { id: 3, name: "Exploitation", desc: "Vulnerability detonation", mitre: "T1068" },
  { id: 4, name: "Installation", desc: "Trojan & rootkit persistence", mitre: "T1547" },
  { id: 5, name: "Command & Control", desc: "Covert beaconing channel", mitre: "T1071" },
  { id: 6, name: "Actions on Objectives", desc: "Data exfiltration / extortion", mitre: "T1048" }
];

const ACTORS = [
  { name: "APT29 (Cozy Bear)", origin: "State-Sponsored", tool: "WellMess / CobaltStrike" },
  { name: "Lazarus Group", origin: "Financially Motivated", tool: "AppleJeus / Trojan.Nuke" },
  { name: "FIN7 (Carbanak)", origin: "Organized Cybercrime", tool: "GRIFFON / Carbanak" },
  { name: "LockBit Syndicate", origin: "Ransomware-as-a-Service", tool: "StealBit Exfiltrator" }
];

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

    if (type === 'sever') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'stage') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = 'triangle';
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

export default function KillChain() {
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [quarantinedStages, setQuarantinedStages] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [severedCount, setSeveredCount] = useState(19);

  // Spawns threat
  const spawnThreat = () => {
    const actor = ACTORS[Math.floor(Math.random() * ACTORS.length)];
    return {
      id: `APT-${Math.floor(Math.random() * 900) + 100}`,
      actor: actor.name,
      origin: actor.origin,
      tool: actor.tool,
      progress: 0,
      stage: 0,
      target: `10.0.${Math.floor(Math.random() * 120)}.${Math.floor(Math.random() * 254) + 1}`,
      hash: Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      startTime: new Date().toLocaleTimeString()
    };
  };

  useEffect(() => {
    // Initial threats
    setThreats([spawnThreat(), spawnThreat()]);

    const interval = setInterval(() => {
      if (isPaused) return;

      setThreats(prev => {
        let updated = prev.map(t => {
          // If stage is quarantined, stop progression!
          if (quarantinedStages.includes(t.stage)) {
            return t;
          }
          const increment = 1.2 + Math.random() * 1.5;
          const nextProg = Math.min(100, t.progress + increment);
          const nextStage = Math.min(6, Math.floor((nextProg / 100) * 7));
          return { ...t, progress: nextProg, stage: nextStage };
        });

        // Filter out completed objectives
        updated = updated.filter(t => t.progress < 100);

        // Spawn new threat periodically
        if (Math.random() > 0.55 && updated.length < 5) {
          const fresh = spawnThreat();
          updated.push(fresh);
          playCyberSound('stage', soundEnabled);
        }

        return updated;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isPaused, quarantinedStages, soundEnabled]);

  const toggleQuarantineStage = (stageIdx) => {
    playCyberSound('sever', soundEnabled);
    setQuarantinedStages(prev => {
      const exists = prev.includes(stageIdx);
      const next = exists ? prev.filter(s => s !== stageIdx) : [...prev, stageIdx];
      setAnnouncement(`${STAGES[stageIdx].name} stage ${exists ? 'quarantine lifted' : 'defensively quarantined'}`);
      return next;
    });
  };

  const severPipeline = (threatId) => {
    playCyberSound('sever', soundEnabled);
    setThreats(prev => prev.filter(t => t.id !== threatId));
    setSeveredCount(c => c + 1);
    setSelectedThreat(null);
    setAnnouncement(`Pipeline ${threatId} successfully neutralized before objectives achieved`);
  };

  const handleExport = () => {
    const data = JSON.stringify({
      timestamp: new Date().toISOString(),
      active_pipelines: threats,
      quarantined_stages: quarantinedStages,
      total_severed: severedCount
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberKillChain_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click', soundEnabled);
    setAnnouncement('Exported kill chain telemetry report');
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
            <Flame className="text-emerald-500" size={30} /> Cyber Kill Chain Defense
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            Lockheed Martin 7-Stage APT Pipeline Detection & Mitre ATT&CK Interception
          </p>
        </motion.div>

        {/* Action & A11y Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPaused(!isPaused);
              playCyberSound('click', soundEnabled);
            }}
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
            {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-emerald-400 border border-white/10"
          >
            <Download size={13} /> Export APT Dossier
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col gap-5 flex-1 overflow-hidden">
        
        {/* TOP KILL CHAIN PIPELINE STAGE RUNNER */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-5 md:p-6 bg-black/70 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 z-10 font-mono text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Crosshair size={16} /> 7-STAGE APT SURVEILLANCE & ISOLATION
            </div>
            <div className="text-gray-400">
              Pipelines Disrupted: <strong className="text-emerald-400">{severedCount}</strong>
            </div>
          </div>

          {/* Pipeline Stage Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
            {STAGES.map((s) => {
              const isQuarantined = quarantinedStages.includes(s.id);
              const threatsAtStage = threats.filter(t => t.stage === s.id).length;

              return (
                <div 
                  key={s.id} 
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all relative ${
                    isQuarantined 
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
                      : threatsAtStage > 0 
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isQuarantined ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {s.id + 1}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">{s.mitre}</span>
                    </div>
                    <div className="font-bold text-xs text-white truncate">{s.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{s.desc}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400">
                      {threatsAtStage > 0 ? (
                        <span className="text-amber-400 font-bold">{threatsAtStage} Active</span>
                      ) : (
                        'Clean'
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleQuarantineStage(s.id)}
                      title={isQuarantined ? "Lift Stage Quarantine" : "Isolate & Quarantine Stage"}
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded transition-colors ${
                        isQuarantined ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-rose-500/30 text-gray-300 hover:text-rose-200'
                      }`}
                    >
                      {isQuarantined ? 'Quarantined' : 'Block'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* BOTTOM ACTIVE PIPELINE MONITOR */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bento-card flex flex-col p-0 bg-black/60 overflow-hidden">
          <div className="p-4 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="text-emerald-400" size={17} />
              <h3 className="font-bold text-emerald-100 uppercase tracking-widest text-xs sm:text-sm">
                Active APT Kill-Chain Progression (Click To Sever)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              * Click any pipeline bar for full MITRE ATT&CK forensic analysis
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {threats.map((t) => {
              const currentStage = STAGES[t.stage] || STAGES[0];
              const isDangerous = t.stage >= 5;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedThreat(t);
                    playCyberSound('click', soundEnabled);
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 rounded-xl p-3.5 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{t.id}</span>
                      <span className="text-gray-400">({t.actor})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-300">Target: {t.target}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isDangerous ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        Stage {t.stage + 1}: {currentStage.name}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar through 7 stages */}
                  <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 relative p-[1px]">
                    <motion.div
                      className={`h-full rounded-full ${
                        isDangerous 
                          ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500' 
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      }`}
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {threats.length === 0 && (
              <div className="text-center text-gray-500 font-mono text-sm py-12">
                No active APT progression pipelines detected in perimeter.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* MITRE ATT&CK FORENSIC & SEVER MODAL */}
      <AnimatePresence>
        {selectedThreat && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.94 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="bg-[#040e09] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] font-mono text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck size={18} /> MITRE ATT&CK Threat Dossier
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedThreat(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Threat Pipeline:</span>
                  <span className="text-white font-bold">{selectedThreat.id}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Threat Actor Attribution:</span>
                  <span className="text-emerald-300 font-bold">{selectedThreat.actor}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Affiliation Profile:</span>
                  <span className="text-white">{selectedThreat.origin}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Weaponized Toolset:</span>
                  <span className="text-white">{selectedThreat.tool}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Current Stage & MITRE ID:</span>
                  <span className="text-amber-400 font-bold">{STAGES[selectedThreat.stage]?.name} ({STAGES[selectedThreat.stage]?.mitre})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Target Host Asset:</span>
                  <span className="text-white">{selectedThreat.target}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Payload Integrity Hash:</span>
                  <span className="text-gray-400 truncate max-w-[200px]">{selectedThreat.hash}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => severPipeline(selectedThreat.id)}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                >
                  <Scissors size={16} /> Sever Attack Kill-Chain
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedThreat(null)}
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
