import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Zap, Target, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Intro() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans p-6 overflow-hidden relative">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"
      ></motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl"
      >
        <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 mb-8 backdrop-blur-md">
          <Shield className="text-indigo-400" size={64} />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 tracking-tighter mb-6">
          CyberShield<span className="text-indigo-500">AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 font-medium mb-12 max-w-2xl leading-relaxed">
          The next generation of autonomous threat intelligence. Connect your systems and let artificial intelligence neutralize threats in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/login" className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Access Terminal
          </Link>
          <Link to="/register" className="px-8 py-4 bg-indigo-600/20 border border-indigo-500/30 text-white rounded-xl font-bold hover:bg-indigo-600/40 transition-all flex items-center gap-2 justify-center">
            Initialize Setup <ArrowRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bento-card p-6">
            <Zap className="text-indigo-400 mb-4" size={24} />
            <h3 className="text-lg font-bold text-white mb-2">Real-time Mitigation</h3>
            <p className="text-sm text-gray-400">Instantly detects and drops malicious packets before they hit your network core.</p>
          </div>
          <div className="bento-card p-6">
            <Target className="text-rose-400 mb-4" size={24} />
            <h3 className="text-lg font-bold text-white mb-2">Zero-Day AI</h3>
            <p className="text-sm text-gray-400">Behavioral neural networks identify novel threats that bypass traditional signatures.</p>
          </div>
          <div className="bento-card p-6">
            <Lock className="text-emerald-400 mb-4" size={24} />
            <h3 className="text-lg font-bold text-white mb-2">Zero-Trust Identity</h3>
            <p className="text-sm text-gray-400">Continuous contextual authentication across all nodes in the infrastructure mesh.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
