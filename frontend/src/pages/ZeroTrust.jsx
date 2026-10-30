import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Fingerprint, ScanFace, X, Key, ShieldCheck, ShieldAlert, 
  Volume2, VolumeX, Download, Filter, CheckCircle2, Lock, Smartphone, 
  Activity, AlertTriangle, Shield
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

    if (type === 'auth_pass') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'auth_fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio restricted
  }
};

export default function ZeroTrust() {
  const [authRequests, setAuthRequests] = useState([]);
  const [selectedAuth, setSelectedAuth] = useState(null);
  const [scanState, setScanState] = useState(0);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'VERIFIED', 'REJECTED'
  const [policyMode, setPolicyMode] = useState('STANDARD'); // 'STANDARD', 'STRICT_FIDO2', 'LOCKDOWN'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const generateAuth = () => {
    const users = ['cfo.wilson', 'sec.lead_chen', 'devops.admin', 'sys_service', 'contractor_402'];
    const devices = ['MacBook Pro (M3 Secure Enclave)', 'Debian Hardened Bastion', 'iPhone 15 Pro (FaceID FIDO2)', 'Unknown Windows Host (Untrusted)'];
    const locations = [
      { loc: 'New York, US', ip: '198.51.100.22', velocity: '0 km/h' },
      { loc: 'London, UK', ip: '185.22.10.14', velocity: '45 km/h' },
      { loc: 'Tokyo, JP', ip: '210.140.10.88', velocity: '1,420 km/h (Impossible Travel)' },
      { loc: 'Moscow, RU', ip: '95.173.136.9', velocity: '980 km/h (High Risk Velocity)' }
    ];

    const locItem = locations[Math.floor(Math.random() * locations.length)];
    const isImpossible = locItem.velocity.includes('Impossible') || locItem.loc.includes('Moscow');
    const isApproved = policyMode === 'LOCKDOWN' ? false : !isImpossible && Math.random() > 0.25;

    return {
      id: `AUTH-${Math.random().toString().substr(2, 6).toUpperCase()}`,
      user: users[Math.floor(Math.random() * users.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      location: locItem.loc,
      ip: locItem.ip,
      velocity: locItem.velocity,
      status: isApproved ? 'VERIFIED' : 'REJECTED',
      reason: isApproved ? 'FIDO2_HARDWARE_KEY_VALIDATED' : (isImpossible ? 'IMPOSSIBLE_TRAVEL_ANOMALY' : 'DEVICE_POSTURE_FAILURE'),
      time: new Date().toLocaleTimeString(),
      riskScore: isApproved ? Math.floor(Math.random() * 18) + 2 : Math.floor(Math.random() * 40) + 60,
      tpm: isApproved ? 'TPM 2.0 Attested' : 'TPM Disabled / Tampered'
    };
  };

  useEffect(() => {
    setAuthRequests(Array.from({ length: 8 }).map(generateAuth));

    const interval = setInterval(() => {
      setScanState(prev => (prev + 1) % 100);
      if (Math.random() > 0.45) {
        const fresh = generateAuth();
        setAuthRequests(prev => [fresh, ...prev].slice(0, 25));
        if (fresh.status === 'VERIFIED') {
          playCyberSound('auth_pass', soundEnabled);
        } else {
          playCyberSound('auth_fail', soundEnabled);
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [policyMode, soundEnabled]);

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'ALL') return authRequests;
    return authRequests.filter(r => r.status === filterStatus);
  }, [authRequests, filterStatus]);

  const handleRevoke = (authId) => {
    playCyberSound('auth_fail', soundEnabled);
    setAuthRequests(prev => prev.filter(r => r.id !== authId));
    setSelectedAuth(null);
    setAnnouncement(`Revoked session and issued mandatory hardware re-authentication for ${authId}`);
  };

  const handleExport = () => {
    const data = JSON.stringify({
      exported_at: new Date().toISOString(),
      policy_mode: policyMode,
      total_authentications: authRequests.length,
      audit_stream: filteredRequests
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZeroTrust_Identity_Audit_${Date.now()}.json`;
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
            <ScanFace className="text-emerald-500 animate-pulse" size={30} /> Zero-Trust Continuous Identity
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            FIDO2 Hardware Attestation, Biometric Enclaves & Impossible-Travel Telemetry
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-emerald-300 border border-white/10"
          >
            <Download size={13} /> Export Audit Stream
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden">
        
        {/* LEFT BIOMETRIC SCANNER & ENCLAVE POSTURE */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-[1.2] bento-card relative bg-black/70 overflow-hidden flex flex-col p-6 justify-between">
          <div className="flex items-center justify-between z-10 font-mono text-xs text-gray-400 border-b border-white/10 pb-3">
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck size={16} /> FIDO2 HARDWARE ENCLAVE
            </span>
            <span className="text-[10px] text-gray-400">NIST SP 800-207</span>
          </div>

          {/* Central Biometric Fingerprint Laser Hologram */}
          <div className="relative w-48 h-56 mx-auto my-6 flex flex-col items-center justify-center">
            <Fingerprint size={160} className={`transition-colors duration-300 ${
              scanState % 20 < 10 ? 'text-emerald-400' : 'text-emerald-700/50'
            } filter drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]`} />
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }} 
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }} 
              className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] z-10" 
            />
          </div>

          {/* Bottom Policy Mode Toggles */}
          <div className="z-10 space-y-3 border-t border-white/10 pt-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Zero-Trust Policy Mode:</span>
              <div className="flex gap-1.5 text-[11px]">
                {['STANDARD', 'STRICT_FIDO2', 'LOCKDOWN'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setPolicyMode(m);
                      playCyberSound('click', soundEnabled);
                    }}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      policyMode === m 
                        ? (m === 'LOCKDOWN' ? 'bg-rose-600 text-white font-bold' : 'bg-emerald-600 text-white font-bold') 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-gray-500">TPM Attestation:</span>
                <div className="text-emerald-400 font-bold">Secure Boot OK</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-gray-500">Geo-Velocity Engine:</span>
                <div className="text-emerald-400 font-bold">Active Shield</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT CONTINUOUS AUTH STREAM */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-[2] bento-card flex flex-col p-0 bg-black/60 overflow-hidden">
          <div className="p-4 bg-emerald-950/30 border-b border-emerald-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Key className="text-emerald-400" size={17} />
              <h3 className="font-bold text-emerald-100 uppercase tracking-widest text-xs sm:text-sm">
                Continuous Access Stream (Click to Audit)
              </h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1 text-[11px] font-mono">
              {['ALL', 'VERIFIED', 'REJECTED'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setFilterStatus(st);
                    playCyberSound('click', soundEnabled);
                  }}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    filterStatus === st 
                      ? (st === 'REJECTED' ? 'bg-rose-600 text-white font-bold' : 'bg-emerald-600 text-white font-bold') 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            <AnimatePresence>
              {filteredRequests.map(req => (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={req.id} 
                  onClick={() => {
                    setSelectedAuth(req);
                    playCyberSound('click', soundEnabled);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    req.status === 'REJECTED' 
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60' 
                      : 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-xs font-mono">
                    <span className="text-white font-bold flex items-center gap-2">
                      <span>{req.user}</span>
                      <span className="text-[10px] text-gray-500 font-normal">({req.id})</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {req.status} (Risk: {req.riskScore}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-mono">
                    <span className="truncate max-w-[260px]">{req.device}</span>
                    <span className={req.velocity.includes('Impossible') ? 'text-rose-400 font-bold' : 'text-gray-400'}>
                      {req.location}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ZERO-TRUST AUDIT & REVOCATION DRAWER */}
      <AnimatePresence>
        {selectedAuth && (
          <motion.div 
            initial={{ x: 500, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 500, opacity: 0 }} 
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-black/95 backdrop-blur-3xl border-l border-emerald-500/30 z-50 p-6 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] font-mono text-xs"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck size={18} /> Zero-Trust Contextual Audit
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuth(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className={`p-4 rounded-xl text-center space-y-1 border ${
                selectedAuth.status === 'REJECTED' ? 'bg-rose-950/30 border-rose-500/30' : 'bg-emerald-950/30 border-emerald-500/30'
              }`}>
                <div className="text-[10px] uppercase text-gray-400 tracking-widest">Calculated Risk Score</div>
                <div className={`text-2xl font-black ${selectedAuth.status === 'REJECTED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedAuth.riskScore}% {selectedAuth.status === 'REJECTED' ? '(HIGH RISK)' : '(LOW RISK)'}
                </div>
              </div>

              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">User Identity:</span>
                  <span className="text-white font-bold">{selectedAuth.user}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Hardware Profile:</span>
                  <span className="text-white">{selectedAuth.device}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">TPM State:</span>
                  <span className="text-emerald-400">{selectedAuth.tpm}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Geo Origin & IP:</span>
                  <span className="text-white">{selectedAuth.location} ({selectedAuth.ip})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Velocity Vector:</span>
                  <span className={selectedAuth.velocity.includes('Impossible') ? 'text-rose-400 font-bold' : 'text-gray-300'}>
                    {selectedAuth.velocity}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Auth Reason Code:</span>
                  <span className="text-gray-300">{selectedAuth.reason}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleRevoke(selectedAuth.id)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                >
                  <Lock size={16} /> Revoke Active Session & Challenge FIDO2
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
