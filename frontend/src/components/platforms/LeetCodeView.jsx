'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, CheckCircle2, Clock, ExternalLink, Code2 } from 'lucide-react';
import SubmissionHeatmap from '../SubmissionHeatmap';

function CustomLCTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0A0E14] text-[#E6EDF3] p-3 rounded-lg border border-[#00FF9C]/40 shadow-[0_0_20px_-4px_#00FF9C] font-mono text-xs space-y-1 max-w-xs">
        <p className="font-bold text-sm text-[#00FF9C]">{item.name}</p>
        <p className="text-[#00FF9C] font-bold">🏆 Contest Rating: {item.rating}</p>
        {item.rank !== 'N/A' && <p className="text-[#7C5CFF]">📊 Rank: #{item.rank}</p>}
        {item.problemsSolved !== undefined && (
          <p className="text-[#E6EDF3]">✅ Solved: {item.problemsSolved}/{item.totalProblems || 4}</p>
        )}
      </div>
    );
  }
  return null;
}

export default function LeetCodeView({ data, username }) {
  if (!username) {
    return (
      <div className="cyber-card p-8 text-center text-[#7C8797] font-bold text-xs font-mono">
        No LeetCode handle linked. Click &quot;Edit Handles&quot; to connect your LeetCode username!
      </div>
    );
  }

  const lcData = data?.leetcode || {};
  const profile = lcData.profile || {};
  const contestHistory = lcData.contest_history || {};

  const totalSolved = profile.totalSolved || 0;
  const easySolved = profile.easySolved || 0;
  const totalEasy = profile.totalEasy || 900;
  const mediumSolved = profile.mediumSolved || 0;
  const totalMedium = profile.totalMedium || 2000;
  const hardSolved = profile.hardSolved || 0;
  const totalHard = profile.totalHard || 900;

  const ranking = profile.ranking || 'N/A';

  const contestRating = Math.round(contestHistory.contestRating || profile.rating || 0);
  const contestGlobalRanking = contestHistory.contestGlobalRanking || 'N/A';
  const contestTopPercentage = contestHistory.contestTopPercentage ? `${contestHistory.contestTopPercentage}%` : 'N/A';
  const contestAttend = contestHistory.contestAttend || 0;

  const contestParticipation = Array.isArray(contestHistory.contestParticipation)
    ? contestHistory.contestParticipation
    : Array.isArray(contestHistory.contestRatingHistogram)
    ? contestHistory.contestRatingHistogram
    : [];

  const chartData = contestParticipation
    .filter((c) => c.attended !== false && (c.rating || c.ratingNumber))
    .map((item, idx) => ({
      name: item.contest?.title || `Contest #${idx + 1}`,
      shortName: item.contest?.title ? item.contest.title.replace('Weekly Contest ', 'W').replace('Biweekly Contest ', 'BW') : `#${idx + 1}`,
      rating: Math.round(item.rating || item.ratingNumber || 0),
      rank: item.ranking || 'N/A',
      problemsSolved: item.problemsSolved,
      totalProblems: item.totalProblems
    }));

  const recentSubmissions = Array.isArray(profile.recentSubmissions)
    ? profile.recentSubmissions
    : Array.isArray(lcData.recentSubmissions)
    ? lcData.recentSubmissions
    : [];

  return (
    <div className="space-y-6 font-mono text-[#E6EDF3]">
            <div className="cyber-card p-6 bg-[#0D1219] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#00FF9C]/30 shadow-[0_0_30px_-5px_rgba(0,255,156,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A0E14] border border-[#00FF9C]/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_-4px_#00FF9C]">
            <Code2 className="w-7 h-7 text-[#00FF9C]" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#E6EDF3]">LeetCode Overview</h3>
            <p className="text-xs text-[#7C8797]">@{username}</p>
          </div>
        </div>

        <a
          href={`https://leetcode.com/u/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cyber px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Visit LeetCode</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Total Solved</span>
          <span className="text-3xl font-extrabold text-[#00FF9C]">{totalSolved}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Global Rank</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">#{ranking}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Contest Rating</span>
          <span className="text-3xl font-extrabold text-[#00FF9C]">{contestRating > 0 ? contestRating : 'Unrated'}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Top Percentage</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">{contestTopPercentage}</span>
        </div>
      </div>

            <div className="cyber-panel p-6 bg-[#10151F] space-y-4">
        <h4 className="font-bold text-lg text-[#E6EDF3]">Difficulty Distribution</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0A0E14] border border-[#1F2733] rounded-lg space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#E6EDF3]">
              <span>Easy</span>
              <span className="text-[#00FF9C]">{easySolved} / {totalEasy}</span>
            </div>
            <div className="w-full bg-[#10151F] h-2.5 rounded-full overflow-hidden border border-[#1F2733]">
              <div
                className="bg-[#00FF9C] h-full rounded-full"
                style={{ width: `${Math.min(100, (easySolved / (totalEasy || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-[#0A0E14] border border-[#1F2733] rounded-lg space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#E6EDF3]">
              <span>Medium</span>
              <span className="text-[#7C5CFF]">{mediumSolved} / {totalMedium}</span>
            </div>
            <div className="w-full bg-[#10151F] h-2.5 rounded-full overflow-hidden border border-[#1F2733]">
              <div
                className="bg-[#7C5CFF] h-full rounded-full"
                style={{ width: `${Math.min(100, (mediumSolved / (totalMedium || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-[#0A0E14] border border-[#1F2733] rounded-lg space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#E6EDF3]">
              <span>Hard</span>
              <span className="text-[#FF6B4A]">{hardSolved} / {totalHard}</span>
            </div>
            <div className="w-full bg-[#10151F] h-2.5 rounded-full overflow-hidden border border-[#1F2733]">
              <div
                className="bg-[#FF6B4A] h-full rounded-full"
                style={{ width: `${Math.min(100, (hardSolved / (totalHard || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

            <div className="cyber-panel p-6 bg-[#10151F] space-y-4">
        <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00FF9C]" /> Contest Rating Curve
          </span>
          <span className="text-xs text-[#7C8797] font-normal">Attended: {contestAttend} Contests</span>
        </h4>
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2733" opacity={0.5} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#7C8797' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#7C8797' }} />
                <Tooltip content={<CustomLCTooltip />} />
                <Area type="monotone" dataKey="rating" stroke="#00FF9C" strokeWidth={3} fill="#00FF9C" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-[#7C8797] text-xs font-bold">
            No contest history available for LeetCode handle <span className="text-[#00FF9C]">{username}</span>.
          </div>
        )}
      </div>

            <SubmissionHeatmap
        submissions={recentSubmissions}
        submissionCalendar={profile.submissionCalendar || lcData.submissionCalendar}
        colorTheme="green"
        title="LeetCode Submission Heatmap"
      />

            {recentSubmissions.length > 0 && (
        <div className="cyber-panel p-6 bg-[#10151F] space-y-3">
          <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00FF9C]" /> Recent Submissions
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {recentSubmissions.map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-sm">
                <div>
                  <div className="font-bold text-xs text-[#E6EDF3]">{sub.title}</div>
                  <div className="text-[10px] text-[#7C8797] font-mono mt-0.5">
                    {sub.lang} • {sub.timestamp ? new Date(Number(sub.timestamp) * 1000).toLocaleDateString() : ''}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#00FF9C]/15 border border-[#00FF9C]/40 text-[#00FF9C]">
                  {sub.statusDisplay}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
