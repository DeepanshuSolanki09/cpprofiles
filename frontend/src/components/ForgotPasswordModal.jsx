'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Send, ArrowRight } from 'lucide-react';
import { audioSynth } from '@/utils/audioSynth';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(['', '', '', '']);

  if (!isOpen) return null;

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!email) return;

    if (audioSynth) audioSynth.playWhoosh();
    setStep(2);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (audioSynth) audioSynth.playFanfare();
    setStep(3);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (audioSynth) audioSynth.playPop();

    if (value && index < 3) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const resetModal = () => {
    setStep(1);
    setEmail('');
    setCode(['', '', '', '']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-black border-2 border-[#FFD700] rounded-3xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-2xl shadow-yellow-950/40 text-[#FFD700] font-sans">
        <button
          onClick={resetModal}
          className="absolute top-4 right-4 text-[#FFD700]/70 hover:text-[#FFD700] font-bold text-xl cursor-pointer"
        >
          ✕
        </button>

        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-black border-2 border-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_-3px_#FFD700]">
                <Mail className="w-7 h-7 text-[#FFD700]" />
              </div>
              <h3 className="font-black text-2xl text-white tracking-wide">Recover Password</h3>
              <p className="text-[#FFD700]/70 text-xs mt-1">
                Enter your registered solver email to receive an instant recovery code.
              </p>
            </div>

            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block font-bold text-[#FFD700]/80 text-xs uppercase mb-1.5">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="solver@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-[#FFD700]/30 rounded-xl text-xs text-white placeholder:text-[#FFD700]/40 focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg shadow-yellow-500/20"
              >
                <span>Dispatch Recovery Code</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="w-14 h-14 bg-black border-2 border-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_-3px_#FFD700]">
              <Mail className="w-7 h-7 text-[#FFD700]" />
            </div>
            <h3 className="font-black text-2xl text-white tracking-wide mb-1">Code Sent!</h3>
            <p className="text-[#FFD700]/70 text-xs mb-6">
              We dispatched a 4-digit verification code to <span className="font-bold text-[#FFD700]">{email}</span>.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="flex justify-center gap-3">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`code-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    className="w-12 h-14 bg-black border-2 border-[#FFD700]/50 rounded-xl text-center font-black text-2xl text-white focus:outline-none focus:border-[#FFD700] focus:shadow-[0_0_15px_-3px_#FFD700]"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20"
              >
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-16 h-16 text-[#FFD700] mx-auto mb-3 animate-bounce" />
            <h3 className="font-black text-2xl text-white tracking-wide mb-2">Access Restored!</h3>
            <p className="text-[#FFD700]/70 text-xs mb-6">
              Your secret code was verified successfully. You can now log back into CP_PROFILES!
            </p>

            <button
              onClick={resetModal}
              className="w-full py-3 bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
