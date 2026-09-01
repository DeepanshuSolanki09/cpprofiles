'use client';

import React from 'react';
import { 
  Sparkles, Trophy, Brain, AlertTriangle, Users, 
  Code2, Terminal, FolderGit, Cpu, Zap, Download, ShieldCheck, CheckCircle2, Flame
} from 'lucide-react';
import { audioSynth } from '@/utils/audioSynth';

export default function HeroPageShowcase({ onNavigateTab, user }) {
  const features = [
    {
      id: 'dashboards',
      title: '5-Platform Live Sync',
      desc: 'Seamlessly aggregates live stats, rating histories, contest graphs, and submission logs across LeetCode, Codeforces, CodeChef, AtCoder, and GitHub.',
      icon: <Trophy className="w-8 h-8 text-amber-500" />,
      badge: 'Multi-Platform',
      bg: 'bg-amber-50 border-amber-300',
      actionTab: 'profiles'
    },
    {
      id: 'weakness',
      title: 'AI Weakness & Vector Recommender',
      desc: 'AI LLM analyzes your rating gaps and queries a FAISS vector database of 15,000+ problems to recommend target practice problems.',
      icon: <AlertTriangle className="w-8 h-8 text-rose-500" />,
      badge: 'AI + Vector DB',
      bg: 'bg-rose-50 border-rose-300',
      actionTab: 'weakness'
    },
    {
      id: 'analysis',
      title: 'AI Profile Performance Report',
      desc: 'Generates comprehensive AI performance breakdowns, identifying your strongest data structures, algorithms, and speed metrics.',
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      badge: 'AI Coach',
      bg: 'bg-purple-50 border-purple-300',
      actionTab: 'analysis'
    },
    {
      id: '3dcard',
      title: 'Interactive 3D Shareable Card',
      desc: 'Hover over mouse-tilt 3D holographic hero cards and export high-resolution PNG images to share your achievements with 1 click.',
      icon: <Sparkles className="w-8 h-8 text-indigo-500" />,
      badge: '3D + Export',
      bg: 'bg-indigo-50 border-indigo-300',
      actionTab: 'profiles'
    },
    {
      id: 'leaderboard',
      title: 'Global Solved Leaderboard',
      desc: 'Real-time ranked leaderboard featuring top solver podiums, live hero search, and per-platform solved pill badges.',
      icon: <Zap className="w-8 h-8 text-emerald-500" />,
      badge: 'Live Rankings',
      bg: 'bg-emerald-50 border-emerald-300',
      actionTab: 'leaderboard'
    },
    {
      id: 'directory',
      title: 'Hero Directory & Profile Modals',
      desc: 'Explore other heroes in the community, view their linked platform handles, and inspect live analytics cards in interactive modals.',
      icon: <Users className="w-8 h-8 text-sky-500" />,
      badge: 'Community',
      bg: 'bg-sky-50 border-sky-300',
      actionTab: 'all_users'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-3 border-gray-900 rounded-3xl p-6 sm:p-10 soft-comic-shadow-lg font-fredoka space-y-10">
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 border-3 border-gray-900 rounded-3xl p-8 sm:p-12 soft-comic-shadow-sm text-gray-950 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/90 border-2 border-gray-900 rounded-full font-lilita text-xs text-orange-950 uppercase tracking-wider soft-comic-shadow-sm">
            <Flame className="w-4 h-4 text-orange-600 animate-bounce" /> CP PROFILES ENGINE
          </div>

          <h1 className="font-lilita text-4xl sm:text-5xl text-gray-950 leading-tight">
            Master Competitive Programming With AI Power
          </h1>

          <p className="text-gray-950 text-base sm:text-lg font-semibold leading-relaxed">
            The ultimate all-in-one platform for competitive programmers. Sync stats across <span className="font-bold underline">5 platforms</span>, diagnose rating weaknesses with <span className="font-bold underline">AI Diagnostics</span>, generate <span className="font-bold underline">3D shareable cards</span>, and climb the <span className="font-bold underline">global leaderboard</span>!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (audioSynth) audioSynth.playPop();
                if (onNavigateTab) onNavigateTab('leaderboard');
              }}
              className="px-6 py-3 bg-white hover:bg-amber-100 text-gray-950 font-lilita text-base border-3 border-gray-900 rounded-2xl flex items-center gap-2 btn-soft-comic cursor-pointer shadow-md"
            >
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>Explore Leaderboard</span>
            </button>

            <button
              onClick={() => {
                if (audioSynth) audioSynth.playPop();
                if (onNavigateTab) onNavigateTab('weakness');
              }}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-lilita text-base border-3 border-gray-900 rounded-2xl flex items-center gap-2 btn-soft-comic cursor-pointer shadow-md"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>AI Weakness Radar</span>
            </button>
          </div>
        </div>

                <div className="relative shrink-0 flex items-center justify-center">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-amber-200 border-4 border-gray-900 rounded-3xl flex items-center justify-center text-7xl sm:text-8xl soft-comic-shadow-lg scale-105 transform hover:rotate-3 transition-transform">
            {user?.profile_picture || '🐻'}
          </div>
          <div className="absolute -bottom-3 -right-3 px-4 py-1.5 bg-emerald-400 border-3 border-gray-900 rounded-2xl font-lilita text-sm text-gray-950 soft-comic-shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-950" /> VERIFIED HERO
          </div>
        </div>
      </div>

            <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="font-lilita text-3xl text-gray-900">App Ecosystem & Core Features</h2>
          <p className="text-gray-600 text-sm font-semibold">
            Everything you need to analyze, improve, and share your competitive coding journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div
              key={feat.id}
              className={`p-6 rounded-3xl border-3 border-gray-900 soft-comic-shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-transform ${feat.bg}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-white border-2 border-gray-900 rounded-2xl soft-comic-shadow-sm">
                    {feat.icon}
                  </div>
                  <span className="px-3 py-1 bg-white border-2 border-gray-900 rounded-full font-lilita text-xs text-gray-900 uppercase">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="font-lilita text-xl text-gray-900">{feat.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed font-semibold">{feat.desc}</p>
              </div>

              <button
                onClick={() => {
                  if (audioSynth) audioSynth.playPop();
                  if (onNavigateTab) onNavigateTab(feat.actionTab);
                }}
                className="w-full py-2.5 bg-white hover:bg-amber-100 text-gray-950 border-2 border-gray-900 rounded-xl font-lilita text-xs flex items-center justify-center gap-2 btn-soft-comic cursor-pointer mt-2"
              >
                <span>Launch Feature</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          ))}
        </div>
      </div>

            <div className="bg-white p-6 rounded-3xl border-3 border-gray-900 soft-comic-shadow-sm space-y-4 text-center">
        <h4 className="font-lilita text-lg text-gray-900">Supported Competitive Platforms</h4>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="px-4 py-2 bg-amber-100 border-2 border-gray-900 rounded-2xl font-lilita text-sm text-amber-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-700" /> LeetCode
          </div>
          <div className="px-4 py-2 bg-sky-100 border-2 border-gray-900 rounded-2xl font-lilita text-sm text-sky-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-700" /> Codeforces
          </div>
          <div className="px-4 py-2 bg-orange-100 border-2 border-gray-900 rounded-2xl font-lilita text-sm text-orange-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-700" /> CodeChef
          </div>
          <div className="px-4 py-2 bg-emerald-100 border-2 border-gray-900 rounded-2xl font-lilita text-sm text-emerald-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-700" /> AtCoder
          </div>
          <div className="px-4 py-2 bg-purple-100 border-2 border-gray-900 rounded-2xl font-lilita text-sm text-purple-900 flex items-center gap-2">
            <FolderGit className="w-4 h-4 text-purple-700" /> GitHub
          </div>
        </div>
      </div>
    </div>
  );
}
