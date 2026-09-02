'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Code2, Terminal, FolderGit, Trophy, Cpu, Mail, RefreshCw, Zap } from 'lucide-react';
import { audioSynth } from '@/utils/audioSynth';
import LeetCodeView from '@/components/platforms/LeetCodeView';
import CodeforcesView from '@/components/platforms/CodeforcesView';
import CodeChefView from '@/components/platforms/CodeChefView';
import AtCoderView from '@/components/platforms/AtCoderView';
import GitHubView from '@/components/platforms/GitHubView';
import UnifiedContestView from '@/components/platforms/UnifiedContestView';
import UnifiedSolvedView from '@/components/platforms/UnifiedSolvedView';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '') + '/users';

export default function UserProfileModal({ user, onClose }) {
  const [activePlatform, setActivePlatform] = useState('all_contests');
  const [userDashboardData, setUserDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchUserDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const res = await fetch(`${API_BASE}/dashboard/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserDashboardData(data);
        }
      } catch (err) {
        console.warn('Target user dashboard fetch error', err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchUserDashboard();
  }, [user]);

  if (!user) return null;

  const profile = user.profile || {};

  const platforms = [
    {
      id: 'all_contests',
      name: 'Contests Dashboard',
      username: 'All Platforms',
      icon: <Trophy className="w-4 h-4 text-[#00FF9C]" />,
      component: <UnifiedContestView data={userDashboardData} userProfiles={profile} />
    },
    {
      id: 'all_solved',
      name: 'Solved Dashboard',
      username: 'All Platforms',
      icon: <Zap className="w-4 h-4 text-[#00FF9C]" />,
      component: <UnifiedSolvedView data={userDashboardData} />
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      username: profile.leetcode_username,
      icon: <Code2 className="w-4 h-4 text-[#00FF9C]" />,
      url: profile.leetcode_username ? `https://leetcode.com/u/${profile.leetcode_username}` : null,
      component: <LeetCodeView data={userDashboardData} username={profile.leetcode_username} />
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      username: profile.cf_username,
      icon: <Terminal className="w-4 h-4 text-[#00FF9C]" />,
      url: profile.cf_username ? `https://codeforces.com/profile/${profile.cf_username}` : null,
      component: <CodeforcesView data={userDashboardData} username={profile.cf_username} />
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      username: profile.cc_username,
      icon: <Trophy className="w-4 h-4 text-[#00FF9C]" />,
      url: profile.cc_username ? `https://www.codechef.com/users/${profile.cc_username}` : null,
      component: <CodeChefView data={userDashboardData} username={profile.cc_username} />
    },
    {
      id: 'atcoder',
      name: 'AtCoder',
      username: profile.atcoder_username,
      icon: <Cpu className="w-4 h-4 text-[#00FF9C]" />,
      url: profile.atcoder_username ? `https://atcoder.jp/users/${profile.atcoder_username}` : null,
      component: <AtCoderView data={userDashboardData} username={profile.atcoder_username} />
    },
    {
      id: 'github',
      name: 'GitHub',
      username: profile.github_username,
      icon: <FolderGit className="w-4 h-4 text-[#00FF9C]" />,
      url: profile.github_username ? `https://github.com/${profile.github_username}` : null,
      component: <GitHubView data={userDashboardData} username={profile.github_username} />
    }
  ];

  const selectedPlat = platforms.find((p) => p.id === activePlatform) || platforms[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0E14]/85 backdrop-blur-md animate-fadeIn font-mono text-[#E6EDF3]">
      <div className="cyber-panel p-6 sm:p-8 max-w-5xl w-full rounded-2xl relative max-h-[92vh] overflow-y-auto space-y-6 bg-[#10151F]">
        <button
          onClick={() => {
            if (audioSynth) audioSynth.playPop();
            onClose();
          }}
          className="absolute top-5 right-5 text-[#7C8797] hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F2733] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#0A0E14] border border-[#00FF9C]/40 flex items-center justify-center font-bold text-xl text-[#00FF9C]">
              {user.name?.[0]?.toUpperCase() || 'H'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#E6EDF3]">{user.name}</h2>
                <span className="px-2.5 py-0.5 bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 rounded-full text-xs font-bold text-[#7C5CFF]">
                  User #{user.id}
                </span>
              </div>
              <p className="text-[#7C8797] text-xs mt-0.5 flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#7C8797]" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          {loadingDashboard && (
            <span className="flex items-center gap-1.5 text-xs text-[#00FF9C] font-bold animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching Live Analytics...
            </span>
          )}
        </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {platforms.map((plat) => (
            <button
              key={plat.id}
              onClick={() => {
                setActivePlatform(plat.id);
                if (audioSynth) audioSynth.playPop();
              }}
              className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activePlatform === plat.id
                  ? 'bg-[#00FF9C]/15 border-[#00FF9C] text-[#00FF9C] shadow-[0_0_12px_-2px_#00FF9C]'
                  : 'bg-[#0A0E14] border-[#1F2733] text-[#7C8797] hover:text-[#E6EDF3]'
              }`}
            >
              {plat.icon}
              <span className="font-bold text-xs">{plat.name}</span>
            </button>
          ))}
        </div>

                <div className="cyber-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2733]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#0A0E14] border border-[#1F2733]">
                {selectedPlat.icon}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#E6EDF3]">{selectedPlat.name}</h3>
                <span className="text-xs text-[#7C8797]">@{selectedPlat.username || 'Not Linked'}</span>
              </div>
            </div>

            {selectedPlat.url && (
              <a
                href={selectedPlat.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                <span>Visit Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {selectedPlat.component}
        </div>
      </div>
    </div>
  );
}
