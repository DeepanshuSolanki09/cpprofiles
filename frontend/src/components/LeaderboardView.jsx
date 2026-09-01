'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Zap, Search, Award } from 'lucide-react';
import { audioSynth } from '@/utils/audioSynth';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '') + '/users';

export default function LeaderboardView({ onSelectUser }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setLoading(true);
      return fetch(`${API_BASE}/leaderboard`);
    })
    .then((res) => (res && res.ok ? res.json() : []))
    .then((data) => {
      if (isMounted) setLeaderboard(data);
    })
    .catch((err) => console.error('Error fetching leaderboard:', err))
    .finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLeaderboard = leaderboard.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="cyber-panel p-6 sm:p-8 bg-[#10151F] space-y-6 font-mono text-[#E6EDF3]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#1F2733]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00FF9C]/10 border border-[#00FF9C]/30 rounded-lg">
            <Trophy className="w-6 h-6 text-[#00FF9C]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#E6EDF3]">Global Solved Leaderboard</h3>
            <p className="text-[#7C8797] text-xs font-mono">
              Rankings based on total verified problem solves across competitive platforms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#7C8797] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search solvers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-xs font-mono text-[#E6EDF3] placeholder:text-[#7C8797]/50 focus:outline-none focus:border-[#00FF9C]"
            />
          </div>

          <button
            onClick={() => {
              fetchLeaderboard();
              if (audioSynth) audioSynth.playPop();
            }}
            className="btn-cyber-dark px-4 py-2 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

            {filteredLeaderboard.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-2">
                    <div className="order-2 sm:order-1 cyber-card p-5 text-center flex flex-col items-center justify-between space-y-3">
            <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest">2nd Place</span>
            <div className="w-14 h-14 rounded-lg bg-[#0A0E14] border border-[#1F2733] flex items-center justify-center text-xl font-bold text-[#E6EDF3]">
              {filteredLeaderboard[1].profile_picture || '🐻'}
            </div>
            <h4 className="font-bold text-[#E6EDF3] text-sm truncate max-w-[150px]">{filteredLeaderboard[1].name}</h4>
            <span className="font-bold text-lg text-[#00FF9C]">{filteredLeaderboard[1].total_solved} Solved</span>
          </div>

                    <div className="order-1 sm:order-2 cyber-card p-6 text-center border-[#00FF9C]/50 bg-[#00FF9C]/10 scale-105 flex flex-col items-center justify-between space-y-3 relative shadow-[0_0_30px_-5px_#00FF9C]">
            <span className="text-[10px] font-bold text-[#00FF9C] uppercase tracking-widest">1st Place • Top Solver</span>
            <div className="w-16 h-16 rounded-xl bg-[#00FF9C] text-[#0A0E14] border border-[#00FF9C] flex items-center justify-center text-2xl font-bold shadow-[0_0_20px_-2px_#00FF9C]">
              {filteredLeaderboard[0].profile_picture || '👑'}
            </div>
            <h4 className="font-bold text-[#E6EDF3] text-base truncate max-w-[160px]">{filteredLeaderboard[0].name}</h4>
            <span className="font-bold text-2xl text-[#00FF9C]">{filteredLeaderboard[0].total_solved} Solved</span>
          </div>

                    <div className="order-3 cyber-card p-5 text-center flex flex-col items-center justify-between space-y-3">
            <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest">3rd Place</span>
            <div className="w-14 h-14 rounded-lg bg-[#0A0E14] border border-[#1F2733] flex items-center justify-center text-xl font-bold text-[#E6EDF3]">
              {filteredLeaderboard[2].profile_picture || '🐻'}
            </div>
            <h4 className="font-bold text-[#E6EDF3] text-sm truncate max-w-[150px]">{filteredLeaderboard[2].name}</h4>
            <span className="font-bold text-lg text-[#7C5CFF]">{filteredLeaderboard[2].total_solved} Solved</span>
          </div>
        </div>
      )}

            <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#7C8797] text-xs font-bold animate-pulse">
            Calculating problem solves across platform APIs...
          </div>
        ) : filteredLeaderboard.length > 0 ? (
          <div className="divide-y divide-[#1F2733]">
            {filteredLeaderboard.map((hero) => {
              const isTop1 = hero.rank === 1;

              return (
                <div
                  key={hero.id}
                  className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-[#0A0E14]/50 ${
                    isTop1 ? 'bg-[#00FF9C]/5 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#0A0E14] border border-[#1F2733] flex items-center justify-center font-bold text-xs text-[#7C8797] shrink-0">
                      #{hero.rank}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0A0E14] border border-[#1F2733] flex items-center justify-center text-base text-[#00FF9C] shrink-0">
                        {hero.profile_picture || '🐻'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#E6EDF3] flex items-center gap-2">
                          <span>{hero.name}</span>
                          {isTop1 && (
                            <span className="px-2 py-0.5 bg-[#00FF9C]/20 border border-[#00FF9C]/40 text-[#00FF9C] rounded-full text-[10px] font-bold">
                              TOP SOLVER
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#7C8797] font-mono">{hero.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold font-mono">
                    <span className="px-2.5 py-1 bg-[#0A0E14] border border-[#1F2733] text-[#00FF9C] rounded-lg">
                      LC: {hero.leetcode_solved}
                    </span>
                    <span className="px-2.5 py-1 bg-[#0A0E14] border border-[#1F2733] text-[#7C5CFF] rounded-lg">
                      CF: {hero.cf_solved}
                    </span>
                    <span className="px-2.5 py-1 bg-[#0A0E14] border border-[#1F2733] text-[#FF6B4A] rounded-lg">
                      CC: {hero.cc_solved}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-[#7C8797] font-bold uppercase block">Total Solved</span>
                      <span className="font-bold text-xl text-[#00FF9C]">{hero.total_solved}</span>
                    </div>

                    {onSelectUser && (
                      <button
                        onClick={() => {
                          onSelectUser(hero);
                          if (audioSynth) audioSynth.playPop();
                        }}
                        className="btn-cyber-purple px-3 py-1.5 text-xs shrink-0 cursor-pointer"
                      >
                        Profile
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-[#7C8797] text-xs font-bold">
            No solvers found matching &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
