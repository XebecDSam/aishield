import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Server, Activity, X, Database, ShieldAlert, Cpu, 
  Volume2, VolumeX, Download, RefreshCw, Terminal, CheckCircle2, 
  Layers, HardDrive, ShieldCheck, Zap
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

    if (type === 'isolate') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
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

export default function CloudMesh() {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const initialNodes = Array.from({ length: 9 }).map((_, i) => ({
      id: `SRV-${100 + i}`,
      region: ['us-east-1', 'eu-west-2', 'ap-south-1'][i % 3],
      load: Math.floor(Math.random() * 50) + 15,
      memory: `${Math.floor(Math.random() * 40) + 30}%`,
      status: 'HEALTHY',
      uptime: '99.99%',
      activePods: Math.floor(Math.random() * 24) + 6,
      connections: Math.floor(Math.random() * 4500) + 500,
      cveStatus: 'Patch Verified',
      isolated: false
    }));
    setNodes(initialNodes);

    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => {
        if (node.isolated) return node;

        let newLoad = node.load + (Math.random() * 16 - 8);
        newLoad = Math.max(5, Math.min(100, Math.round(newLoad)));
        let newStatus = 'HEALTHY';
        if (newLoad > 82) newStatus = 'CRITICAL';
        else if (newLoad > 68) newStatus = 'WARNING';

        return {
          ...node,
          load: newLoad,
          status: newStatus,
          connections: Math.max(100, node.connections + Math.floor(Math.random() * 80 - 40))
        };
      }));
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const filteredNodes = useMemo(() => {
    if (regionFilter === 'ALL') return nodes;
    return nodes.filter(n => n.region === regionFilter);
  }, [nodes, regionFilter]);

  const handleIsolate = (nodeId) => {
    playCyberSound('isolate', soundEnabled);
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, isolated: true, status: 'ISOLATED', load: 0 } : n));
    setSelectedNode(null);
    setAnnouncement(`Node ${nodeId} quarantined and isolated from cloud VPC mesh`);
  };

  const handleHotpatchAll = () => {
    playCyberSound('click', soundEnabled);
    setNodes(prev => prev.map(n => ({ ...n, cveStatus: 'Kernel Hotpatched (Clean)', load: Math.min(n.load, 45), status: 'HEALTHY' })));
    setAnnouncement('Deployed zero-downtime kernel hotpatch across all fleet nodes');
  };

  const handleExport = () => {
    const report = {
      exported_at: new Date().toISOString(),
      cluster_health: '98.4%',
      fleet_nodes: nodes
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CloudMesh_Fleet_Report_${Date.now()}.json`;
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
            <Server className="text-blue-500 animate-pulse" size={30} /> Cloud Infrastructure Mesh
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            Multi-Region Fleet Telemetry, Egress Quarantine & Kernel Hotpatching
          </p>
        </motion.div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            title={soundEnabled ? 'Mute' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-blue-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <button
            type="button"
            onClick={handleHotpatchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-mono text-emerald-300 border border-emerald-500/40"
          >
            <ShieldCheck size={13} /> Hotpatch All Nodes
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-blue-300 border border-white/10"
          >
            <Download size={13} /> Export Fleet
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col gap-4 flex-1 overflow-hidden">
        
        {/* Top Region Filter Bar */}
        <div className="flex justify-between items-center z-10 font-mono text-xs border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Cluster Region:</span>
            {['ALL', 'us-east-1', 'eu-west-2', 'ap-south-1'].map(reg => (
              <button
                key={reg}
                type="button"
                onClick={() => {
                  setRegionFilter(reg);
                  playCyberSound('click', soundEnabled);
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  regionFilter === reg 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          <div className="text-gray-400">
            Fleet: <strong className="text-white">{filteredNodes.length}</strong> Virtual Machines Online
          </div>
        </div>

        {/* 3D-Isometric Fleet Nodes Grid */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 bento-card relative bg-black/70 overflow-hidden flex items-center justify-center p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12 w-full max-w-4xl">
            {filteredNodes.map((node) => {
              const isHealthy = node.status === 'HEALTHY';
              const isWarning = node.status === 'WARNING';
              const isCritical = node.status === 'CRITICAL';
              const isIsolated = node.isolated;

              return (
                <motion.div 
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    playCyberSound('click', soundEnabled);
                  }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all shadow-xl font-mono relative overflow-hidden ${
                    isIsolated ? 'bg-gray-900/60 border-gray-600 opacity-60' :
                    isCritical ? 'bg-rose-900/40 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]' :
                    isWarning ? 'bg-amber-900/40 border-amber-500 shadow-amber-500/20' :
                    'bg-blue-900/30 border-blue-500/60 shadow-blue-500/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <Server size={24} className={
                      isIsolated ? 'text-gray-400' :
                      isCritical ? 'text-rose-400 animate-pulse' :
                      isWarning ? 'text-amber-400' : 'text-blue-400'
                    } />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isIsolated ? 'bg-gray-500/20 text-gray-300' :
                      isCritical ? 'bg-rose-500/20 text-rose-300' :
                      isWarning ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-white font-bold text-sm">{node.id}</div>
                    <div className="text-[10px] text-gray-400">{node.region}</div>
                  </div>

                  {/* Load Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>CPU Load:</span>
                      <strong className="text-white">{node.load}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-blue-400'
                        }`} 
                        style={{ width: `${node.load}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* NODE INSPECTION & ISOLATION DRAWER */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ y: 500, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 500, opacity: 0 }} 
            className="fixed bottom-0 left-0 right-0 h-[48%] bg-black/95 backdrop-blur-3xl border-t border-blue-500/30 z-50 p-6 shadow-2xl flex flex-col sm:flex-row gap-6 font-mono text-xs"
          >
            <div className="absolute top-4 right-4">
              <button 
                type="button" 
                onClick={() => setSelectedNode(null)} 
                className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Left Drawer Summary */}
            <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-6 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  {selectedNode.id}
                  {selectedNode.status === 'CRITICAL' && <ShieldAlert size={22} className="text-rose-500 animate-pulse" />}
                </h3>
                <p className="text-gray-400 uppercase tracking-widest text-[11px] mt-0.5">
                  Cluster: {selectedNode.region} (Uptime: {selectedNode.uptime})
                </p>

                <div className="mt-4 space-y-1.5 text-gray-300">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Memory Utilization:</span>
                    <span className="text-white font-bold">{selectedNode.memory}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Kubernetes Pods:</span>
                    <span className="text-white font-bold">{selectedNode.activePods} Pods</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">Kernel CVE Status:</span>
                    <span className="text-emerald-400">{selectedNode.cveStatus}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleIsolate(selectedNode.id)}
                  disabled={selectedNode.isolated}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={15} /> {selectedNode.isolated ? 'Node Isolated' : 'Quarantine Node'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    setAnnouncement(`Rebooted microkernel on node ${selectedNode.id}`);
                  }}
                  className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-colors"
                >
                  Reboot VM
                </button>
              </div>
            </div>

            {/* Right Drawer SSH Terminal */}
            <div className="flex-1 flex flex-col bg-black/80 border border-white/10 rounded-xl overflow-hidden p-4 space-y-2">
              <div className="flex items-center justify-between text-gray-400 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Terminal size={14} /> ssh_root@{selectedNode.id}.cluster.local
                </div>
                <span className="text-[10px]">TLS 1.3 mTLS Verified</span>
              </div>
              <div className="flex-1 overflow-auto space-y-1 text-gray-300 font-mono text-[11px] custom-scrollbar">
                <div>[SYSTEM] Established secure eBPF telemetry tap on interface eth0.</div>
                <div>[DOCKER] containerd v1.7.12 healthy. Cgroups v2 enabled.</div>
                <div className="text-emerald-400">[EGRESS] Outbound VPC packet rate: {selectedNode.connections} pkt/sec nominal.</div>
                {selectedNode.status === 'CRITICAL' && (
                  <div className="text-rose-400 font-bold">[WARN] High thread saturation detected in worker daemon (PID 1092).</div>
                )}
                {selectedNode.isolated && (
                  <div className="text-rose-500 font-bold">[QUARANTINE] Egress iptables DROP rules active. Lateral movement halted.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
