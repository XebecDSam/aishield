import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Bitcoin, Link2, X, Network, Volume2, VolumeX, Download, 
  Search, ShieldAlert, CheckCircle2, ShieldCheck, Filter, AlertTriangle, 
  Copy, Check, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SYNDICATES = [
  { name: 'LockBit 3.0', walletPrefix: 'bc1qlock', risk: 'HIGH' },
  { name: 'BlackCat / ALPHV', walletPrefix: 'bc1qcat', risk: 'CRITICAL' },
  { name: 'Royal Ransomware', walletPrefix: 'bc1qroy', risk: 'CRITICAL' },
  { name: 'Conti Legacy', walletPrefix: 'bc1qcon', risk: 'HIGH' }
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

    if (type === 'flagged') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.15);
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

export default function CryptoTracker() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [currency, setCurrency] = useState('BTC'); // 'BTC', 'ETH', 'XMR'
  const [syndicateFilter, setSyndicateFilter] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const generateTx = () => {
    const syn = SYNDICATES[Math.floor(Math.random() * SYNDICATES.length)];
    const isFlagged = Math.random() > 0.45;
    const symbol = currency;
    const amount = symbol === 'BTC' ? (Math.random() * 4.5 + 0.2).toFixed(4) :
                   symbol === 'ETH' ? (Math.random() * 65 + 5).toFixed(2) :
                   (Math.random() * 320 + 20).toFixed(2);

    return {
      hash: Array.from({length: 48}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      currency: symbol,
      amount: amount,
      usdValue: `$${(parseFloat(amount) * (symbol === 'BTC' ? 64000 : symbol === 'ETH' ? 3400 : 160)).toLocaleString(undefined, {maximumFractionDigits: 0})}`,
      from: `${syn.walletPrefix}${Math.random().toString(36).substr(2, 6)}`,
      to: `bc1q${Math.random().toString(36).substr(2, 8)}`,
      syndicate: syn.name,
      mixerHops: Math.floor(Math.random() * 4) + 1,
      ofacSanctioned: isFlagged && Math.random() > 0.5,
      time: new Date().toLocaleTimeString(),
      flagged: isFlagged
    };
  };

  useEffect(() => {
    setTransactions(Array.from({ length: 8 }).map(generateTx));

    const interval = setInterval(() => {
      const fresh = generateTx();
      setTransactions(prev => {
        if (fresh.flagged) playCyberSound('flagged', soundEnabled);
        return [fresh, ...prev].slice(0, 25);
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [currency, soundEnabled]);

  const filteredTx = useMemo(() => {
    if (syndicateFilter === 'ALL') return transactions;
    return transactions.filter(t => t.syndicate === syndicateFilter);
  }, [transactions, syndicateFilter]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playCyberSound('click', soundEnabled);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      currency,
      syndicate_filter: syndicateFilter,
      tracked_ledgers: filteredTx
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Crypto_Ransomware_Ledger_${currency}_${Date.now()}.json`;
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
            <Bitcoin className="text-yellow-500 animate-pulse" size={30} /> Blockchain Ransomware Tracker
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            Illicit Wallet Graphing, Mixing Hops Analysis & OFAC Sanctions Cross-Check
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
            {soundEnabled ? <Volume2 size={14} className="text-yellow-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-yellow-400 border border-white/10"
          >
            <Download size={13} /> Export Ledger
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden">
        
        {/* LEFT BLOCKCHAIN FLOW & MIXER TOPOLOGY */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-[1.8] bento-card relative bg-black/70 overflow-hidden flex flex-col p-6 justify-between">
          
          {/* Currency Switcher & Syndicate Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10 font-mono text-xs border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Currency:</span>
              {['BTC', 'ETH', 'XMR'].map(cur => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => {
                    setCurrency(cur);
                    playCyberSound('click', soundEnabled);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    currency === cur 
                      ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)]' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Syndicate:</span>
              <select
                value={syndicateFilter}
                onChange={e => setSyndicateFilter(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-yellow-300 font-mono focus:outline-none"
              >
                <option value="ALL">All Threat Groups</option>
                {SYNDICATES.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Central Animated Transaction Mixer Topology */}
          <div className="relative flex-1 flex items-center justify-center my-6 overflow-hidden">
            {filteredTx.slice(0, 6).map((tx, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const x = Math.cos(angle) * 145;
              const y = Math.sin(angle) * 145;

              return (
                <motion.div 
                  key={tx.hash} 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="absolute cursor-pointer" 
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  onClick={() => {
                    setSelectedTx(tx);
                    playCyberSound('click', soundEnabled);
                  }}
                >
                  <svg className="absolute top-1/2 left-1/2 w-0 h-0 overflow-visible pointer-events-none -z-10">
                    <line 
                      x1="0" 
                      y1="0" 
                      x2={-x} 
                      y2={-y} 
                      stroke={tx.flagged ? '#f43f5e' : '#eab308'} 
                      strokeWidth="2" 
                      strokeDasharray="4 4" 
                      className="opacity-50 animate-pulse" 
                    />
                  </svg>
                  <div className={`w-16 h-16 rotate-45 border-2 flex items-center justify-center shadow-lg bg-black/90 backdrop-blur-md transition-transform hover:scale-110 ${
                    tx.flagged ? 'border-rose-500 shadow-rose-500/25' : 'border-yellow-500 shadow-yellow-500/20'
                  }`}>
                    <div className="-rotate-45 text-center">
                      <Bitcoin size={18} className={tx.flagged ? 'text-rose-400 mx-auto' : 'text-yellow-400 mx-auto'} />
                      <div className="text-[9px] text-white font-mono font-bold">{tx.amount}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Central Mixer Node */}
            <div className="w-20 h-20 rotate-45 border-2 border-white flex items-center justify-center bg-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(255,255,255,0.2)] z-10">
              <div className="-rotate-45 flex flex-col items-center">
                <Network className="text-white" size={24} />
                <span className="text-[9px] font-bold mt-0.5 tracking-widest uppercase font-mono">Mixer</span>
              </div>
            </div>
          </div>

          <div className="z-10 text-[11px] font-mono text-gray-500 border-t border-white/10 pt-2 flex justify-between">
            <span>* Click any transaction node to inspect OFAC blacklist status</span>
            <span>OFAC SDN Engine: Active</span>
          </div>
        </motion.div>

        {/* RIGHT LEDGER STREAM */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bento-card flex flex-col p-0 bg-black/60 overflow-hidden">
          <div className="p-4 bg-yellow-950/30 border-b border-yellow-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="text-yellow-400" size={17} />
              <h3 className="font-bold text-yellow-100 uppercase tracking-widest text-xs sm:text-sm">
                Live Mempool & Wallet Stream
              </h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {filteredTx.length} Tracked
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            <AnimatePresence>
              {filteredTx.map(tx => (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={tx.hash} 
                  onClick={() => {
                    setSelectedTx(tx);
                    playCyberSound('click', soundEnabled);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    tx.flagged 
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50' 
                      : 'bg-yellow-950/20 border-yellow-500/20 hover:border-yellow-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-xs font-mono">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Bitcoin size={13} className="text-yellow-400" />
                      <span>{tx.amount} {tx.currency}</span>
                      <span className="text-gray-400 text-[10px]">({tx.usdValue})</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      tx.flagged ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {tx.flagged ? 'FLAGGED: EXTORTION' : 'CLEAN'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-mono">
                    <span className="truncate max-w-[200px]">From: {tx.from}</span>
                    <span className="text-yellow-300">{tx.syndicate}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* FORENSIC LEDGER DOSSIER MODAL */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.94 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className="bg-[#0e0c03] border border-yellow-500/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(234,179,8,0.3)] font-mono text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                  <Bitcoin size={18} /> Blockchain Forensic Audit
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Transaction Value:</span>
                  <span className="text-yellow-400 font-bold">{selectedTx.amount} {selectedTx.currency} ({selectedTx.usdValue})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Ransomware Syndicate:</span>
                  <span className="text-rose-400 font-bold">{selectedTx.syndicate}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">Mixer / Tumbler Hops:</span>
                  <span className="text-white">{selectedTx.mixerHops} Intermediate Hops</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-400">OFAC Sanctions Status:</span>
                  <span className={selectedTx.ofacSanctioned ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedTx.ofacSanctioned ? 'MATCH CONFIRMED (OFAC Specially Designated National)' : 'CLEAN / NO OFAC LISTING'}
                  </span>
                </div>
                <div>
                  <div className="text-gray-400 mb-1 flex justify-between">
                    <span>Transaction Hash:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedTx.hash, 'tx')}
                      className="text-[10px] text-yellow-400 flex items-center gap-1"
                    >
                      {copiedKey === 'tx' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'tx' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-lg text-gray-300 break-all select-all">
                    {selectedTx.hash}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playCyberSound('click', soundEnabled);
                    setSelectedTx(null);
                    setAnnouncement(`Submitted exchange freeze alert for ${selectedTx.hash.slice(0, 10)}...`);
                  }}
                  className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={16} /> Broadcast Exchange Freeze Request
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
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
