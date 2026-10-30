import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, ShieldAlert, Activity, FileKey, MessageSquare, Download, BookOpen, Database, ArrowRight, Zap, CheckCircle2, Globe, Brain, Bug, Eye, Flame, Server, ScanFace, Bitcoin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logActivity } from '../utils/logger';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_events: 0, threats_blocked: 0, risk_score: 0, recent_alerts: [] });
  const navigate = useNavigate();

  useEffect(() => {
    logActivity('VIEW_DASHBOARD', 'User accessed the SIEM Dashboard view.');
    axios.get(`${API_URL}/api/dashboard/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  const downloadReport = async () => {
    try {
      logActivity('GENERATE_REPORT', 'User initiated download of Executive SOC Report.');
      const res = await axios.get(`${API_URL}/api/reports/download`);
      const byteCharacters = atob(res.data.pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = res.data.filename;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    { title: 'Global Threat Radar', subtitle: 'Live Network Visualizer', icon: Globe, link: '/threat-map', color: 'text-rose-400', col: 'md:col-span-4' },
    { title: 'Security Arsenal', subtitle: 'Advanced Tools & Scanners', icon: FileKey, link: '/tools', color: 'text-indigo-400', col: 'md:col-span-4' },
    { title: 'Cyber Kill Chain', subtitle: 'APT Tracking Pipeline', icon: Flame, link: '/kill-chain', color: 'text-emerald-400', col: 'md:col-span-4' },
    
    { title: 'AI Cyber Agent', subtitle: 'Intelligent Assistant', icon: MessageSquare, link: '/chatbot', color: 'text-purple-400', col: 'md:col-span-3' },
    { title: 'Malware Sandbox', subtitle: 'Execution Detonation', icon: Bug, link: '/sandbox', color: 'text-amber-500', col: 'md:col-span-3' },
    { title: 'Dark Web Intel', subtitle: 'Deep Web Scraping', icon: Eye, link: '/dark-web', color: 'text-fuchsia-400', col: 'md:col-span-3' },
    { title: 'Database Admin', subtitle: 'System & User Records', icon: Database, link: '/dbadmin', color: 'text-cyan-400', col: 'md:col-span-3' },
    
    { title: 'Volumetric Shield', subtitle: 'DDoS Packet Filtering', icon: Shield, link: '/volumetric-shield', color: 'text-cyan-500', col: 'md:col-span-4' },
    { title: 'Neural Net AI', subtitle: 'Behavior Analysis', icon: Brain, link: '/neural-net', color: 'text-purple-500', col: 'md:col-span-4' },
    { title: 'Awareness Exam', subtitle: 'Security Validation', icon: BookOpen, link: '/quiz', color: 'text-amber-400', col: 'md:col-span-4' },

    { title: 'Zero-Trust Identity', subtitle: 'Biometric Access Control', icon: ScanFace, link: '/zero-trust', color: 'text-emerald-500', col: 'md:col-span-4' },
    { title: 'Crypto Tracker', subtitle: 'Blockchain Forensics', icon: Bitcoin, link: '/crypto-tracker', color: 'text-yellow-500', col: 'md:col-span-4' },
    { title: 'Cloud Mesh Defense', subtitle: 'Infrastructure Telemetry', icon: Server, link: '/cloud-mesh', color: 'text-blue-500', col: 'md:col-span-4' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-[1500px] mx-auto font-sans relative z-10 flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            <Shield className="text-indigo-500" size={36} /> CyberShieldAI
          </h1>
          <p className="text-gray-400 font-medium mt-1">SOC Analytics & Threat Intelligence</p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          onClick={downloadReport}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
        >
          <Download size={18} /> Export SOC Report
        </motion.button>
      </header>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
        
        {/* Main Stats Bento */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-8 p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-gray-400 font-semibold mb-6 flex items-center gap-2">
            <Activity size={18} /> NETWORK STATUS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Security Events</p>
              <p className="text-4xl font-bold text-white">{stats.total_events.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Threats Mitigated</p>
              <p className="text-4xl font-bold text-rose-500 flex items-center gap-2">
                {stats.threats_blocked.toLocaleString()} <ShieldAlert size={20} />
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">System Risk Score</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-amber-500">{stats.risk_score}</p>
                <p className="text-gray-500 mb-1">/ 100</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Status Bento */}
        <motion.div variants={item} className="bento-card col-span-1 md:col-span-4 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400 mb-1">SYSTEM SECURE</h3>
          <p className="text-sm text-gray-400">All defenses operational</p>
        </motion.div>

        {/* Navigation Grid Bento */}
        {navItems.map((nav, i) => (
          <motion.div 
            variants={item} 
            key={i}
            onClick={() => navigate(nav.link)}
            className={`bento-card col-span-1 ${nav.col} p-6 cursor-pointer group flex flex-col justify-between min-h-[220px]`}
          >
            <div className={`p-4 rounded-2xl bg-white/5 w-fit ${nav.color} group-hover:scale-110 transition-transform duration-300`}>
              <nav.icon size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                {nav.title}
              </h3>
              <p className="text-sm text-gray-400">{nav.subtitle}</p>
            </div>
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="text-white" />
            </div>
          </motion.div>
        ))}

      </motion.div>
    </div>
  );
}
