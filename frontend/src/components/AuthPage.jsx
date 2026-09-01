'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Terminal, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Zap, Code2, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '') + '/users';

const AVATARS = [
  { id: 'bear', text: 'CP', label: 'Solver' },
  { id: 'cat', text: 'LC', label: 'Knight' },
  { id: 'fox', text: 'CF', label: 'Master' },
  { id: 'robot', text: 'CC', label: '6-Star' },
  { id: 'bunny', text: 'GH', label: 'Coder' },
];

export default function AuthPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [selectedAvatar, setSelectedAvatar] = useState('bear');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [cfUser, setCfUser] = useState('');
  const [codechefUser, setCodechefUser] = useState('');
  const [atcoderUser, setAtcoderUser] = useState('');
  const [githubUser, setGithubUser] = useState('');

  const formRef = useRef(null);
  const brandRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (brandRef.current) {
        gsap.fromTo(
          brandRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      }

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)', delay: 0.2 }
        );
      }
    });
    return () => ctx.revert();
  }, [activeTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      onLoginSuccess(data);
    } catch (err) {
      setErrorMessage(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const payload = {
      name: regName,
      email: regEmail,
      password: regPassword,
      profile_picture: AVATARS.find(a => a.id === selectedAvatar)?.text || 'CP',
      profile: {
        leetcode_username: leetcodeUser || null,
        cf_username: cfUser || null,
        cc_username: codechefUser || null,
        atcoder_username: atcoderUser || null,
        github_username: githubUser || null,
      },
    };

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      onLoginSuccess(data);
    } catch (err) {
      setErrorMessage(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#FFD700] flex flex-col items-center justify-center p-4 sm:p-6 relative font-sans selection:bg-[#FFD700] selection:text-black overflow-hidden">
      
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#FFD700]/10 blur-[150px] rounded-full pointer-events-none z-0" />

            <div ref={brandRef} className="flex items-center gap-3 mb-6 relative z-10 opacity-0">
        <div className="w-11 h-11 rounded-2xl bg-[#FFD700] p-0.5 flex items-center justify-center shadow-[0_0_20px_-2px_#FFD700]">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <Code2 className="w-6 h-6 text-[#FFD700]" />
          </div>
        </div>
        <div>
          <span className="font-black text-2xl text-white tracking-tight">
            CP<span className="text-[#FFD700]">_PROFILES</span>
          </span>
          <span className="text-[10px] text-[#FFD700] block font-extrabold tracking-widest uppercase">
            Unified Competitive Portal
          </span>
        </div>
      </div>

            <div ref={formRef} className="w-full max-w-md bg-black border-2 border-[#FFD700]/40 rounded-3xl p-6 sm:p-8 relative z-10 space-y-6 shadow-2xl shadow-yellow-950/30 opacity-0">
        
                <div className="flex bg-black p-1 rounded-2xl border border-[#FFD700]/30">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#FFD700] text-black shadow-lg shadow-yellow-500/20'
                : 'text-[#FFD700]/70 hover:text-[#FFD700]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#FFD700] text-black shadow-lg shadow-yellow-500/20'
                : 'text-[#FFD700]/70 hover:text-[#FFD700]'
            }`}
          >
            Create Account
          </button>
        </div>

                {errorMessage && (
          <div className="p-3.5 bg-yellow-500/10 border border-[#FFD700]/40 rounded-xl flex items-center gap-2.5 text-[#FFD700] text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FFD700]" />
            <span>{errorMessage}</span>
          </div>
        )}

                {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700]/80 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FFD700]/60" />
                <input
                  type="email"
                  required
                  placeholder="solver@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700]/80 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FFD700]/60" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-[#FFD700] font-bold hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In To Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

                {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700]/80 mb-1.5">Avatar Badge</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      selectedAvatar === av.id
                        ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-md'
                        : 'bg-black border-[#FFD700]/30 text-[#FFD700] hover:border-[#FFD700]'
                    }`}
                  >
                    <span>{av.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700]/80 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FFD700]/60" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700]/80 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FFD700]/60" />
                <input
                  type="email"
                  required
                  placeholder="solver@domain.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700]/80 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FFD700]/60" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#FFD700]/20">
              <span className="text-[10px] text-[#FFD700]/70 font-bold uppercase tracking-widest block">Competitive Handles (Optional)</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="LeetCode Handle"
                  value={leetcodeUser}
                  onChange={(e) => setLeetcodeUser(e.target.value)}
                  className="px-3 py-2 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
                <input
                  type="text"
                  placeholder="Codeforces Handle"
                  value={cfUser}
                  onChange={(e) => setCfUser(e.target.value)}
                  className="px-3 py-2 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
                <input
                  type="text"
                  placeholder="CodeChef Handle"
                  value={codechefUser}
                  onChange={(e) => setCodechefUser(e.target.value)}
                  className="px-3 py-2 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-[#E6EDF3] placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
                <input
                  type="text"
                  placeholder="GitHub Username"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  className="px-3 py-2 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-[#E6EDF3] placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Creating Account...</span>
              ) : (
                <>
                  <span>Create Account Now</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
