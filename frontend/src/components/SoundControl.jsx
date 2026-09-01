'use client';

import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioSynth } from '@/utils/audioSynth';

export default function SoundControl({ isMuted, setIsMuted }) {
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioSynth) {
      audioSynth.setMuted(nextMuted);
      if (!nextMuted) {
        audioSynth.playPop();
      }
    }
  };

  const testFx = () => {
    if (audioSynth) {
      audioSynth.playBoing();
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
      <button
        onClick={testFx}
        className="px-3 py-2 bg-amber-100 text-amber-900 border-2 border-gray-900 rounded-xl font-fredoka text-sm btn-soft-comic flex items-center gap-1.5 cursor-pointer"
        title="Test sound effect"
      >
        <Sparkles className="w-4 h-4 text-amber-600" />
        <span className="hidden sm:inline">SFX Test</span>
      </button>

      <button
        onClick={toggleMute}
        className={`p-2.5 rounded-xl border-2 border-gray-900 font-fredoka text-sm btn-soft-comic flex items-center justify-center cursor-pointer transition-colors ${
          isMuted ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
        }`}
        title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
