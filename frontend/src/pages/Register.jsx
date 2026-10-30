import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound } from 'lucide-react';
import axios from 'axios';
import { logActivity } from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/auth/register`, { username, password });
      logActivity('USER_REGISTER', `New user registered: ${username}`);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bento-card w-full max-w-md p-10 flex flex-col items-center"
      >
        <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30 mb-6">
          <KeyRound className="text-purple-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Identity</h1>
        <p className="text-gray-400 text-sm mb-8 font-medium">Generate your CyberShieldAI access keys</p>

        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm text-center font-medium">
              {error}
            </motion.div>
          )}
          
          <div>
            <input 
              type="text" 
              placeholder="Desired Username" 
              required 
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              className="modern-input focus:border-purple-500/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Secure Password" 
              required 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              className="modern-input focus:border-purple-500/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            />
          </div>
          
          <button type="submit" className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]">
            Initialize Account <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-400">
          Already verified? <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">Authenticate here</Link>
        </div>
      </motion.div>
    </div>
  );
}
