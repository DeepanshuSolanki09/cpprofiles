'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Terminal, ExternalLink, Trophy, CheckCircle2, Clock } from 'lucide-react';

import SubmissionHeatmap from '../SubmissionHeatmap';

function CustomCFTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0A0E14] text-[#E6EDF3] p-3 rounded-lg border border-[#7C5CFF]/40 shadow-[0_0_20px_-4px_#7C5CFF] font-mono text-xs space-y-1 max-w-xs">
        <p className="font-bold text-sm text-[#7C5CFF]">{item.name}</p>
        <p className="text-[#7C5CFF] font-bold">🏆 Rating: {item.rating}</p>
        <p className="text-[#E6EDF3]">📊 Rank: #{item.rank}</p>
        <p className="text-[#00FF9C]">⚡ Change: {item.change >= 0 ? `+${item.change}` : item.change}</p>
        <p className="text-[#7C8797] text-[10px]">{item.date}</p>
      </div>
    );
  }
  return null;
}

export default function CodeforcesView({ data, username }) {
  if (!username) {
    return (
      <div className="cyber-card p-8 text-center text-[#7C8797] font-bold text-xs font-mono">
        No Codeforces handle linked. Click &quot;Edit Handles&quot; to connect your Codeforces username!
      </div>
    );
  }

  const cfData = data?.codeforces || {};
  const profile = cfData.profile || {};
  const info = Array.isArray(profile?.info?.result)
    ? profile.info.result[0]
    : cfData.info?.result?.[0] || {};

  const rating = info.rating || 0;
  const maxRating = info.maxRating || 0;
  const rank = info.rank || 'Unrated';
  const maxRank = info.maxRank || 'Unrated';

  const ratingHistory = Array.isArray(cfData.contest_history?.result)
    ? cfData.contest_history.result
    : Array.isArray(profile.rating?.result)
    ? profile.rating.result
    : Array.isArray(cfData.rating?.result)
    ? cfData.rating.result
    : [];

  const chartData = ratingHistory.map((item, idx) => ({
    name: item.contestName || `Contest #${idx + 1}`,
    shortName: item.contestId ? `#${item.contestId}` : `#${idx + 1}`,
    rating: item.newRating,
    change: item.newRating - item.oldRating,
    rank: item.rank,
    date: new Date(item.ratingUpdateTimeSeconds * 1000).toLocaleDateString()
  }));

  const submissions = Array.isArray(profile.status?.result)
    ? profile.status.result
    : Array.isArray(cfData.status?.result)
    ? cfData.status.result
    : [];

  const okSet = new Set(submissions.filter((s) => s.verdict === 'OK').map((s) => `${s.problem?.contestId}-${s.problem?.index}`));
  const totalSolvedCount = okSet.size > 0 ? okSet.size : 0;

  return (
    <div className="space-y-6 font-mono text-[#E6EDF3]">
            <div className="cyber-card p-6 bg-[#0D1219] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#7C5CFF]/30 shadow-[0_0_30px_-5px_rgba(124,92,255,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A0E14] border border-[#7C5CFF]/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_-4px_#7C5CFF]">
            <Terminal className="w-7 h-7 text-[#7C5CFF]" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#E6EDF3]">Codeforces Overview</h3>
            <p className="text-xs text-[#7C8797]">@{username}</p>
          </div>
        </div>

        <a
          href={`https://codeforces.com/profile/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cyber-purple px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Visit Codeforces</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Current Rating</span>
          <span className="text-3xl font-extrabold text-[#7C5CFF]">{rating > 0 ? rating : 'Unrated'}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Max Rating</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">{maxRating > 0 ? maxRating : 'N/A'}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Rank / Max Rank</span>
          <span className="text-lg font-extrabold text-[#7C5CFF] capitalize">{rank} / {maxRank}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Verified Solved</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">{totalSolvedCount}</span>
        </div>
      </div>

            <div className="cyber-panel p-6 bg-[#10151F] space-y-4">
        <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#7C5CFF]" /> Codeforces Rating History
          </span>
          <span className="text-xs text-[#7C8797] font-normal">Contests: {ratingHistory.length}</span>
        </h4>
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2733" opacity={0.5} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#7C8797' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#7C8797' }} />
                <Tooltip content={<CustomCFTooltip />} />
                <Area type="monotone" dataKey="rating" stroke="#7C5CFF" strokeWidth={3} fill="#7C5CFF" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-[#7C8797] text-xs font-bold">
            No rating history available for Codeforces handle <span className="text-[#7C5CFF]">{username}</span>.
          </div>
        )}
      </div>

            <SubmissionHeatmap
        submissions={submissions}
        colorTheme="purple"
        title="Codeforces Submission Heatmap"
      />

            {submissions.length > 0 && (
        <div className="cyber-panel p-6 bg-[#10151F] space-y-3">
          <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#7C5CFF]" /> Recent Submissions
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {submissions.slice(0, 15).map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-sm">
                <div>
                  <div className="font-bold text-xs text-[#E6EDF3]">
                    {sub.problem?.name} ({sub.problem?.contestId}{sub.problem?.index})
                  </div>
                  <div className="text-[10px] text-[#7C8797] font-mono mt-0.5">
                    {sub.programmingLanguage} • {new Date(sub.creationTimeSeconds * 1000).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    sub.verdict === 'OK' ? 'bg-[#00FF9C]/15 border-[#00FF9C]/40 text-[#00FF9C]' : 'bg-[#FF6B4A]/15 border-[#FF6B4A]/40 text-[#FF6B4A]'
                  }`}
                >
                  {sub.verdict === 'OK' ? 'Accepted' : sub.verdict}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
