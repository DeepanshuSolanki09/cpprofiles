'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Brain, AlertTriangle, Users, LogOut, 
  Code2, Terminal, FolderGit, Cpu, RefreshCw, Pencil, Zap, Sparkles, ExternalLink
} from 'lucide-react';
import gsap from 'gsap';
import EditProfileModal from '@/components/EditProfileModal';
import UserProfileModal from '@/components/UserProfileModal';
import Shareable3DCardModal from '@/components/Shareable3DCardModal';
import LeaderboardView from '@/components/LeaderboardView';
import LeetCodeView from '@/components/platforms/LeetCodeView';
import CodeforcesView from '@/components/platforms/CodeforcesView';
import CodeChefView from '@/components/platforms/CodeChefView';
import AtCoderView from '@/components/platforms/AtCoderView';
import GitHubView from '@/components/platforms/GitHubView';
import UnifiedContestView from '@/components/platforms/UnifiedContestView';
import UnifiedSolvedView from '@/components/platforms/UnifiedSolvedView';
import { audioSynth } from '@/utils/audioSynth';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '') + '/users';

export default function VipDashboard({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('profiles');
  const [activePlatform, setActivePlatform] = useState('all_contests');

  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const [weaknessData, setWeaknessData] = useState(null);
  const [loadingWeakness, setLoadingWeakness] = useState(false);

  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const navTabsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power4.out' }
        );
      }

      if (navTabsRef.current) {
        gsap.fromTo(
          navTabsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
        );
      }

      if (containerRef.current) {
        const cards = containerRef.current.querySelectorAll('.yellow-dash-card');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
          );
        }
      }
    });
    return () => ctx.revert();
  }, [activeTab, activePlatform]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    setLoadingDashboard(true);
    try {
      const queryParams = new URLSearchParams();
      if (user?.profile?.leetcode_username) queryParams.append('leetcode', user.profile.leetcode_username);
      if (user?.profile?.cf_username) queryParams.append('codeforces', user.profile.cf_username);
      if (user?.profile?.cc_username) queryParams.append('codechef', user.profile.cc_username);
      if (user?.profile?.atcoder_username) queryParams.append('atcoder', user.profile.atcoder_username);
      if (user?.profile?.github_username) queryParams.append('github', user.profile.github_username);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await fetch(`${API_BASE}/dashboard/${user.id}${queryString}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchWeaknessAnalysis = async (force = false) => {
    if (!user?.id || !user?.access_token) return;
    setLoadingWeakness(true);
    try {
      const url = `${API_BASE}/weakness/${user.id}${force ? '?force_refresh=true' : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWeaknessData(data);
      }
    } catch (err) {
      console.error('Error fetching weakness analysis:', err);
    } finally {
      setLoadingWeakness(false);
    }
  };

  const fetchProfileAnalysis = async (force = false) => {
    if (!user?.id || !user?.access_token) return;
    setLoadingAnalysis(true);
    try {
      const url = `${API_BASE}/analysis/${user.id}${force ? '?force_refresh=true' : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisData(data);
      }
    } catch (err) {
      console.error('Error fetching AI profile analysis:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error('Error fetching all users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      Promise.resolve().then(() => {
        if (isMounted) setLoadingDashboard(true);
        return fetch(`${API_BASE}/dashboard/${user.id}`);
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) setDashboardData(data);
      })
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => {
        if (isMounted) setLoadingDashboard(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleNavTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (audioSynth) audioSynth.playPop();
    if (tabKey === 'weakness' && !weaknessData) fetchWeaknessAnalysis();
    if (tabKey === 'analysis' && !analysisData) fetchProfileAnalysis();
    if (tabKey === 'all_users' && allUsers.length === 0) fetchAllUsers();
  };

  const platforms = [
    {
      id: 'all_contests',
      name: 'Contests Dashboard',
      icon: <Trophy className="w-4 h-4 text-[#FFD700]" />,
      component: <UnifiedContestView data={dashboardData} userProfiles={user?.profile} />
    },
    {
      id: 'all_solved',
      name: 'Solved Dashboard',
      icon: <Zap className="w-4 h-4 text-[#FFD700]" />,
      component: <UnifiedSolvedView data={dashboardData} />
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      icon: <Code2 className="w-4 h-4 text-[#FFD700]" />,
      username: user?.profile?.leetcode_username,
      component: <LeetCodeView data={dashboardData} username={user?.profile?.leetcode_username} />
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      icon: <Terminal className="w-4 h-4 text-[#FFD700]" />,
      username: user?.profile?.cf_username,
      component: <CodeforcesView data={dashboardData} username={user?.profile?.cf_username} />
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      icon: <Trophy className="w-4 h-4 text-[#FFD700]" />,
      username: user?.profile?.cc_username,
      component: <CodeChefView data={dashboardData} username={user?.profile?.cc_username} />
    },
    {
      id: 'atcoder',
      name: 'AtCoder',
      icon: <Cpu className="w-4 h-4 text-[#FFD700]" />,
      username: user?.profile?.atcoder_username,
      component: <AtCoderView data={dashboardData} username={user?.profile?.atcoder_username} />
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <FolderGit className="w-4 h-4 text-[#FFD700]" />,
      username: user?.profile?.github_username,
      component: <GitHubView data={dashboardData} username={user?.profile?.github_username} />
    }
  ];

  const selectedPlat = platforms.find((p) => p.id === activePlatform) || platforms[0];
  const report = analysisData?.analysis || {};

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-black text-[#FFD700] p-4 sm:p-8 font-sans selection:bg-[#FFD700] selection:text-black relative overflow-hidden">
      
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FFD700]/5 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
                <div ref={headerRef} className="rounded-3xl bg-black border-2 border-[#FFD700]/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-yellow-950/20 opacity-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-black border-2 border-[#FFD700] flex items-center justify-center text-3xl font-black text-[#FFD700] shadow-[0_0_20px_-4px_#FFD700]">
              {user?.profile_picture || 'CP'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-black text-2xl sm:text-3xl text-white tracking-tight">{user?.name || 'CP Solver'}</h1>
                <span className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/40 rounded-full text-xs text-[#FFD700] font-black uppercase tracking-widest">
                  ACTIVE PLAYER
                </span>
              </div>
              <p className="text-[#FFD700]/70 text-xs mt-1 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setCardModalOpen(true);
                if (audioSynth) audioSynth.playPop();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Share 3D Card</span>
            </button>

            <button
              onClick={() => {
                setEditModalOpen(true);
                if (audioSynth) audioSynth.playPop();
              }}
              className="px-5 py-2.5 rounded-xl bg-black text-[#FFD700] border border-[#FFD700]/40 hover:border-[#FFD700] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Handles</span>
            </button>

            <button
              onClick={() => {
                if (audioSynth) audioSynth.playPop();
                onLogout();
              }}
              className="px-4 py-2.5 rounded-xl bg-black text-[#FFD700]/60 hover:text-[#FFD700] border border-[#FFD700]/20 hover:border-[#FFD700]/40 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

                <div ref={navTabsRef} className="flex items-center gap-3 border-b border-[#FFD700]/20 pb-4 overflow-x-auto opacity-0">
          {[
            { id: 'profiles', label: 'Platform Hub', icon: <Code2 className="w-4 h-4" /> },
            { id: 'weakness', label: 'AI Weakness Radar', icon: <Brain className="w-4 h-4" /> },
            { id: 'analysis', label: 'AI Profile Report', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'leaderboard', label: 'Global Rankings', icon: <Trophy className="w-4 h-4" /> },
            { id: 'all_users', label: 'Hero Directory', icon: <Users className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavTabChange(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFD700] text-black shadow-lg shadow-yellow-500/20'
                  : 'bg-black border border-[#FFD700]/30 text-[#FFD700]/70 hover:text-[#FFD700] hover:border-[#FFD700]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

                {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePlatform(p.id);
                      if (audioSynth) audioSynth.playPop();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activePlatform === p.id
                        ? 'bg-[#FFD700] text-black shadow-md'
                        : 'bg-black border border-[#FFD700]/30 text-[#FFD700]/70 hover:text-[#FFD700]'
                    }`}
                  >
                    {p.icon}
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 rounded-xl bg-black border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold flex items-center gap-2 hover:border-[#FFD700] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDashboard ? 'animate-spin' : ''}`} />
                <span>Sync Data</span>
              </button>
            </div>

            <div className="yellow-dash-card rounded-3xl bg-black border border-[#FFD700]/30 p-6 sm:p-8 min-h-[450px]">
              {selectedPlat.component}
            </div>
          </div>
        )}

                {activeTab === 'weakness' && (
          <div className="yellow-dash-card rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#FFD700]/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl">
                  <Brain className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">AI Weakness Diagnostic Radar</h3>
                  <p className="text-xs text-[#FFD700]/70">Vector similarity analysis of submission errors across all platforms</p>
                </div>
              </div>

              <button
                onClick={() => fetchWeaknessAnalysis(true)}
                className="px-4 py-2 rounded-xl bg-black border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-[#FFD700] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingWeakness ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            </div>

            {loadingWeakness ? (
              <div className="py-16 text-center text-[#FFD700] text-xs font-bold animate-pulse">
                Analyzing submissions via AI vector similarity...
              </div>
            ) : weaknessData ? (
              <div className="space-y-6">
                {weaknessData.raw_analysis && (
                  <div className="p-4 rounded-2xl bg-black border border-[#FFD700]/30 text-xs text-white leading-relaxed">
                    <strong className="text-[#FFD700] uppercase font-bold block mb-1">Diagnostic Summary:</strong>
                    {weaknessData.raw_analysis}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">Identified Algorithmic Gaps</h4>
                      {weaknessData.weakness?.rating && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-bold">
                          Target: {weaknessData.weakness.rating} ({weaknessData.weakness.difficulty || 'Medium'})
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {((Array.isArray(weaknessData.weaknesses) && weaknessData.weaknesses.length > 0)
                        ? weaknessData.weaknesses
                        : (Array.isArray(weaknessData.weakness?.topics) && weaknessData.weakness.topics.length > 0)
                        ? weaknessData.weakness.topics
                        : ['Implementation', 'Dynamic Programming', 'Graphs']
                      ).map((w, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-black border border-[#FFD700]/20 text-xs text-white font-bold flex items-center justify-between hover:border-[#FFD700]/40 transition-colors">
                          <span>{typeof w === 'string' ? w : (w.topic || w.name || 'Algorithmic Gap')}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-extrabold uppercase border border-rose-500/20">High Priority</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-4">
                    <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">Recommended Practice Problems</h4>
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {((Array.isArray(weaknessData.recommendations) && weaknessData.recommendations.length > 0)
                        ? weaknessData.recommendations
                        : (Array.isArray(weaknessData.recommended_problems) && weaknessData.recommended_problems.length > 0)
                        ? weaknessData.recommended_problems
                        : []
                      ).map((rec, idx) => (
                        <a
                          key={idx}
                          href={rec.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl bg-black border border-[#FFD700]/25 hover:border-[#FFD700] text-xs text-[#FFD700] font-semibold flex items-center justify-between gap-3 transition-all hover:translate-x-1 group cursor-pointer"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-white font-bold truncate group-hover:text-[#FFD700] transition-colors">
                              {rec.title || `Problem #${rec.id || idx + 1}`}
                            </span>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="capitalize px-1.5 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 font-mono">
                                {rec.platform || 'CP'}
                              </span>
                              {rec.rating && (
                                <span className="text-gray-400 font-mono">
                                  Rating: {rec.rating}
                                </span>
                              )}
                              {rec.difficulty && (
                                <span className="text-amber-400 font-semibold">
                                  {rec.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-[#FFD700] shrink-0 group-hover:scale-110 transition-transform" />
                        </a>
                      ))}
                      {(!weaknessData.recommendations || weaknessData.recommendations.length === 0) &&
                       (!weaknessData.recommended_problems || weaknessData.recommended_problems.length === 0) && (
                        <div className="p-4 text-center text-xs text-[#FFD700]/70 font-semibold border border-[#FFD700]/20 rounded-xl">
                          No specific problem matches found in database. Run dataset sync to load problems.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#FFD700]/70 text-xs font-bold">
                Click &quot;Re-Analyze&quot; to run full weakness diagnostic analysis.
              </div>
            )}
          </div>
        )}

                {activeTab === 'analysis' && (
          <div className="yellow-dash-card rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#FFD700]/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">AI Profile Executive Report</h3>
                  <p className="text-xs text-[#FFD700]/70">Comprehensive performance audit & growth roadmap</p>
                </div>
              </div>

              <button
                onClick={() => fetchProfileAnalysis(true)}
                className="px-4 py-2 rounded-xl bg-black border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-[#FFD700] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalysis ? 'animate-spin' : ''}`} />
                <span>Refresh Report</span>
              </button>
            </div>

            {loadingAnalysis ? (
              <div className="py-16 text-center text-[#FFD700] text-xs font-bold animate-pulse">
                Generating AI Executive Report...
              </div>
            ) : analysisData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-4">
                    <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">Skill Strengths</h4>
                    <div className="flex flex-wrap gap-2">
                      {(report.strong_topics || ['Implementation', 'Math']).map((st, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          ✓ {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-4">
                    <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">Focus Growth Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {(report.weak_topics || ['Dynamic Programming', 'Graphs']).map((wt, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                          ⚠ {wt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-2 md:col-span-2">
                    <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">Platform Recommendation</h4>
                    <p className="text-xs text-white leading-relaxed font-sans">
                      {report.platform_recommendation || 'Focus on Codeforces for speed and contest strategy, LeetCode for pattern practice.'}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-2">
                    <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">Consistency Rating</h4>
                    <div className="text-2xl font-black text-[#FFD700] font-mono">
                      {report.consistency_score || '7/10'}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {report.contest_insight || 'Regular practice recommended.'}
                    </p>
                  </div>
                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-3">
                    <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">How to Improve</h4>
                    <ul className="space-y-2">
                      {(report.how_to_improve || ['Solve 2 medium problems daily', 'Participate in regular contests']).map((item, idx) => (
                        <li key={idx} className="text-xs text-white flex items-start gap-2">
                          <span className="text-[#FFD700] font-bold">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-3">
                    <h4 className="text-xs font-black text-[#FFD700] uppercase tracking-wider">Rating Roadmap</h4>
                    <div className="space-y-2">
                      {(report.rating_roadmap || ['Phase 1: Practice Topic Fundamentals', 'Phase 2: Virtual Contest Speedruns']).map((phase, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-black border border-[#FFD700]/20 text-xs text-[#FFD700] font-semibold flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/40 text-[#FFD700] text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#FFD700]/70 text-xs font-bold">
                Click &quot;Refresh Report&quot; to generate executive profile analysis.
              </div>
            )}
          </div>
        )}

                {activeTab === 'leaderboard' && (
          <div className="yellow-dash-card rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-8">
            <LeaderboardView />
          </div>
        )}

                {activeTab === 'all_users' && (
          <div className="yellow-dash-card rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#FFD700]/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl">
                  <Users className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Hero Directory</h3>
                  <p className="text-xs text-[#FFD700]/70">Explore community profiles and active competitive handles</p>
                </div>
              </div>

              <button
                onClick={fetchAllUsers}
                className="px-4 py-2 rounded-xl bg-black border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh Directory</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="py-16 text-center text-[#FFD700] text-xs font-bold animate-pulse">
                Fetching community hero profiles...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUsers.map((u) => (
                  <div key={u.id} className="p-4 rounded-2xl bg-black border border-[#FFD700]/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black border border-[#FFD700] flex items-center justify-center font-black text-[#FFD700] text-base">
                        {u.profile_picture || 'CP'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{u.name}</div>
                        <div className="text-xs text-[#FFD700]/70">{u.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUserDetail(u)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFD700] text-black font-black text-xs cursor-pointer"
                    >
                      Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onUserUpdate={onUserUpdate}
      />

      {selectedUserDetail && (
        <UserProfileModal
          user={selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
        />
      )}

      <Shareable3DCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        user={user}
        dashboardData={dashboardData}
      />
    </div>
  );
}
