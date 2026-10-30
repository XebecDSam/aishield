import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bot, User, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logActivity } from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Secure connection established. CyberShield AI Core online. How can I assist with your security operations today?' }
  ]);
  const [userMsg, setUserMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    logActivity('AI_INTERACTION', 'User initialized AI Cyber Agent session.');
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userMsg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setUserMsg('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai/chatbot`, { message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: Connection to AI Core severed.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen p-4 md:p-8 flex flex-col font-sans max-w-5xl mx-auto">
      <header className="mb-6 flex justify-between items-center shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Cyber Agent</h1>
          <p className="text-gray-400 font-medium mt-1 text-sm">CyberShieldAI Intelligence</p>
        </motion.div>
        <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bento-card flex flex-col overflow-hidden relative"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence>
            {messages.map((m, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${m.role === 'user' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-purple-500/20 border-purple-500/30 text-purple-400'}`}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[75%] shadow-md ${m.role === 'user' ? 'bg-indigo-600/90 text-white rounded-tr-sm' : 'bg-white/10 border border-white/5 text-gray-200 rounded-tl-sm'}`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/20 border border-purple-500/30 text-purple-400">
                <Bot size={20} />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md">
          <form onSubmit={handleSend} className="flex gap-4">
            <input 
              type="text" 
              value={userMsg} 
              onChange={(e) => setUserMsg(e.target.value)} 
              placeholder="Query the AI Core..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
            <button type="submit" disabled={isTyping || !userMsg.trim()} className="px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <Send size={20} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
