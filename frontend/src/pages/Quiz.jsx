import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, ArrowLeft, CheckCircle, XCircle, Award, Volume2, VolumeX, 
  Download, RotateCcw, ShieldCheck, HelpCircle, ChevronRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_QUESTIONS = [
  {
    id: 1,
    q: "What is the foundational principle of a Zero-Trust Architecture (NIST SP 800-207)?",
    options: [
      "Trust internal network segments by default once authenticated",
      "Never trust, always verify every request as if originating from an open, hostile network",
      "Exclusively enforce single-factor VPN access for remote engineers",
      "Rely entirely on static perimeter firewalls without endpoint inspection"
    ],
    ans: 1,
    explanation: "Zero-Trust assumes breach and verifies explicit identity, device posture, and contextual signals for every single transaction regardless of network location."
  },
  {
    id: 2,
    q: "Which key-derivation function is recommended by OWASP for password hashing to resist GPU/ASIC brute-force attacks?",
    options: [
      "MD5 with a 4-digit salt",
      "Standard single-round SHA-256",
      "Argon2id (Memory-hard & side-channel resistant)",
      "Base64 symmetric obfuscation"
    ],
    ans: 2,
    explanation: "Argon2id is a memory-hard password hashing algorithm that defeats high-parallel GPU and ASIC cracking rigs by requiring configurable RAM and iteration costs."
  },
  {
    id: 3,
    q: "In the Lockheed Martin Cyber Kill Chain, what occurs during the 'Installation' stage?",
    options: [
      "Harvesting email addresses via public WHOIS records",
      "Deploying a persistent backdoor, rootkit, or implant onto the target operating system",
      "Encrypting databases and demanding ransom payments",
      "Coupling an exploit with a malicious PDF payload"
    ],
    ans: 1,
    explanation: "Installation involves establishing persistence (via Windows Run keys, cron jobs, or drivers) so the threat actor retains access even after system reboot."
  },
  {
    id: 4,
    q: "How does a BGP Anycast scrubbing farm mitigate multi-terabit Volumetric DDoS attacks?",
    options: [
      "By shutting down the core web servers until the attack ceases",
      "By routing attack traffic to hundreds of globally distributed edge PoPs that absorb and scrub the flood in parallel",
      "By sending legal cease-and-desist packets to every attacking IP",
      "By encrypting the network cables with RSA-4096"
    ],
    ans: 1,
    explanation: "Anycast announces the same IP address from multiple worldwide data centers, dispersing a 2 Tbps flood into manageable local streams scrubbed by hardware filters."
  },
  {
    id: 5,
    q: "What makes FIDO2 / WebAuthn phishing-resistant compared to traditional SMS OTP codes?",
    options: [
      "It sends the passcode via Telegram rather than cellular network",
      "It cryptographically binds authentication credentials to the verified browser origin (domain name)",
      "It requires a 32-character memorized master passphrase",
      "It does not require any cryptographic keys"
    ],
    ans: 1,
    explanation: "WebAuthn tokens sign challenges with origin binding, meaning a fake phishing site (e.g. `paypa1.com`) cannot capture or replay credentials meant for `paypal.com`."
  }
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

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'triangle';
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

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  const handleSelectAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);

    const isCorrect = idx === ALL_QUESTIONS[current].ans;
    if (isCorrect) {
      setScore(s => s + 1);
      playCyberSound('correct', soundEnabled);
    } else {
      playCyberSound('wrong', soundEnabled);
    }
  };

  const handleNextQuestion = () => {
    playCyberSound('click', soundEnabled);
    setSelected(null);
    setAnswered(false);
    if (current + 1 < ALL_QUESTIONS.length) {
      setCurrent(c => c + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    playCyberSound('click', soundEnabled);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setShowResult(false);
  };

  const handleDownloadCertificate = () => {
    const cert = {
      recipient: "CyberShield Security Analyst",
      credential_id: `CERT-CYBER-${Date.now().toString(36).toUpperCase()}`,
      issued_date: new Date().toLocaleDateString(),
      score: `${score} / ${ALL_QUESTIONS.length}`,
      percentage: `${(score / ALL_QUESTIONS.length) * 100}%`,
      status: score >= 4 ? "CERTIFIED SPECIALIST" : "TRAINING COMPLETED",
      accreditation: "CyberShield AI Defense Framework (NIST SP 800-207 & OWASP aligned)"
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberShield_Certificate_${cert.credential_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click', soundEnabled);
  };

  const currentQ = ALL_QUESTIONS[current];

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-12 max-w-4xl mx-auto font-sans flex flex-col text-slate-100 ${highContrast ? 'contrast-125' : ''}`}>
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="text-amber-500" size={30} /> Security Awareness & Mastery Exam
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm">
            Personnel Cyber Defense Assessment & Certified Credentialing
          </p>
        </motion.div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            title={soundEnabled ? 'Mute' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-amber-400" /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
              highContrast ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            A11Y Contrast
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 hover:bg-white/10">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-center">
        {!showResult ? (
          <div className="bento-card p-6 md:p-10 max-w-2xl mx-auto w-full relative overflow-hidden bg-black/60">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1.5 bg-white/10 w-full">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400" 
                initial={{ width: `${(current / ALL_QUESTIONS.length) * 100}%` }} 
                animate={{ width: `${((current + 1) / ALL_QUESTIONS.length) * 100}%` }} 
              />
            </div>
            
            {/* Question Info Header */}
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <HelpCircle className="text-amber-400" size={20} />
                </div>
                <div>
                  <div className="text-amber-400 text-xs font-bold tracking-widest uppercase font-mono">
                    Question {current + 1} of {ALL_QUESTIONS.length}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">Domain: Federal & NIST Standards</div>
                </div>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                Score: {score}/{ALL_QUESTIONS.length}
              </div>
            </div>

            {/* Question Title */}
            <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed">
              {currentQ.q}
            </h2>

            {/* Option Buttons */}
            <div className="space-y-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === currentQ.ans;
                let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-gray-200";

                if (answered) {
                  if (isCorrect) {
                    btnClass = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                  } else if (isSelected && !isCorrect) {
                    btnClass = "bg-rose-500/20 border-rose-500/60 text-rose-300";
                  } else {
                    btnClass = "bg-white/5 border-white/5 text-gray-500 opacity-40";
                  }
                }

                return (
                  <button 
                    key={i}
                    disabled={answered}
                    onClick={() => handleSelectAnswer(i)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium flex justify-between items-center transition-all ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {answered && isCorrect && <CheckCircle size={18} className="text-emerald-400 shrink-0 ml-2" />}
                    {answered && isSelected && !isCorrect && <XCircle size={18} className="text-rose-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation Deep Dive Callout */}
            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> Cyber Defense Deep Dive:
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-mono">
                  {currentQ.explanation}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors font-mono shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <span>{current + 1 === ALL_QUESTIONS.length ? 'View Final Results' : 'Next Question'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* RESULT CERTIFICATE SCREEN */
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bento-card p-8 md:p-12 text-center max-w-lg mx-auto w-full bg-black/70 border border-amber-500/30 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
              <Award size={42} className="text-amber-400" />
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">Assessment Complete</div>
              <h2 className="text-2xl font-black text-white">
                {score >= 4 ? "Certified Cyber Defense Specialist" : "Training Module Concluded"}
              </h2>
              <div className="text-3xl font-extrabold text-amber-400 font-mono mt-3">
                {score} / {ALL_QUESTIONS.length} Correct ({(score / ALL_QUESTIONS.length) * 100}%)
              </div>
              <p className="text-xs text-gray-400 font-mono mt-2">
                NIST SP 800-207 & Zero-Trust Knowledge Verification Record Created.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownloadCertificate}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Download size={15} /> Download Verifiable Credential
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={15} /> Retake Exam
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
