import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import axios from 'axios';
import { logActivity } from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      logActivity('USER_LOGIN', `User authenticated: ${res.data.username}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
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
        <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 mb-6">
          <Shield className="text-indigo-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-gray-400 text-sm mb-8 font-medium">Authenticate to access CyberShieldAI</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm text-center font-medium">
              {error}
            </motion.div>
          )}
          
          <div>
            <input 
              type="text" 
              placeholder="Username" 
              required 
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              className="modern-input"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              className="modern-input"
            />
          </div>
          
          <button type="submit" className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]">
            Authenticate <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-400">
          Don't have an access key? <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Register here</Link>
        </div>
      </motion.div>
    </div>
  );
}
