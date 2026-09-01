'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, ExternalLink, Clock } from 'lucide-react';

function CustomCCTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0A0E14] text-[#E6EDF3] p-3 rounded-lg border border-[#FF6B4A]/40 shadow-[0_0_20px_-4px_#FF6B4A] font-mono text-xs space-y-1 max-w-xs">
        <p className="font-bold text-sm text-[#FF6B4A]">{item.name}</p>
        <p className="text-[#FF6B4A] font-bold">🏆 Rating: {item.rating}</p>
        <p className="text-[#E6EDF3]">📊 Rank: #{item.rank}</p>
      </div>
    );
  }
  return null;
}

export default function CodeChefView({ data, username }) {
  if (!username) {
    return (
      <div className="cyber-card p-8 text-center text-[#7C8797] font-bold text-xs font-mono">
        No CodeChef handle linked. Click &quot;Edit Handles&quot; to connect your CodeChef username!
      </div>
    );
  }

  const ccData = data?.codechef || {};
  const rating = Number(ccData.rating) || 0;
  const highestRating = Number(ccData.highest_rating) || rating;
  const stars = ccData.stars || 'N/A';
  const problemsSolved = Number(ccData.problems_solved) || 0;

  const ratingHistory = Array.isArray(ccData.rating_history)
    ? ccData.rating_history
    : Array.isArray(ccData.contest_history)
    ? ccData.contest_history
    : Array.isArray(ccData.contests)
    ? ccData.contests
    : Array.isArray(ccData.ratingHistory)
    ? ccData.ratingHistory
    : Array.isArray(ccData.history)
    ? ccData.history
    : Array.isArray(ccData.user_history)
    ? ccData.user_history
    : [];

  const rawChartData = ratingHistory.map((item, idx) => {
    const rVal = item.rating !== undefined
      ? Number(item.rating)
      : item.NewRating !== undefined
      ? Number(item.NewRating)
      : item.newRating !== undefined
      ? Number(item.newRating)
      : 0;

    return {
      name: item.name || item.code || `Contest #${idx + 1}`,
      shortName: item.code ? item.code : `#${idx + 1}`,
      rating: isNaN(rVal) ? 0 : rVal,
      rank: item.rank || 'N/A',
      change: Number(item.rating_change || item.change || 0),
      date: item.end_time ? new Date(item.end_time).toLocaleDateString() : item.getdate || item.date || 'Recent'
    };
  });

  const chartData = rawChartData.filter((d) => d.rating > 0);
  const displayList = chartData.length > 0 ? chartData : rawChartData;

  return (
    <div className="space-y-6 font-mono text-[#E6EDF3]">
            <div className="cyber-card p-6 bg-[#0D1219] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#FF6B4A]/30 shadow-[0_0_30px_-5px_rgba(255,107,74,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A0E14] border border-[#FF6B4A]/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_-4px_#FF6B4A]">
            <Trophy className="w-7 h-7 text-[#FF6B4A]" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#E6EDF3]">CodeChef Overview</h3>
            <p className="text-xs text-[#7C8797]">@{username}</p>
          </div>
        </div>

        <a
          href={`https://www.codechef.com/users/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cyber px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Visit CodeChef</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Current Rating</span>
          <span className="text-3xl font-extrabold text-[#FF6B4A]">{rating > 0 ? rating : 'Unrated'}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Stars Rating</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">{stars}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Highest Rating</span>
          <span className="text-3xl font-extrabold text-[#FF6B4A]">{highestRating > 0 ? highestRating : 'N/A'}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Problems Solved</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">{problemsSolved}</span>
        </div>
      </div>

            <div className="cyber-panel p-6 bg-[#10151F] space-y-4">
        <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FF6B4A]" /> CodeChef Rating History
          </span>
          <span className="text-xs text-[#7C8797] font-normal">Contests: {displayList.length}</span>
        </h4>
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2733" opacity={0.5} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#7C8797' }} />
                <YAxis domain={['dataMin - 50', 'dataMax + 50']} tick={{ fontSize: 11, fill: '#7C8797' }} />
                <Tooltip content={<CustomCCTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="#FF6B4A"
                  strokeWidth={3}
                  fill="#FF6B4A"
                  fillOpacity={0.2}
                  dot={{ r: 4, fill: '#FF6B4A', stroke: '#0A0E14', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-[#7C8797] text-xs font-bold">
            No contest rating graph points available for CodeChef handle <span className="text-[#FF6B4A]">{username}</span>.
          </div>
        )}
      </div>

            {displayList.length > 0 && (
        <div className="cyber-panel p-6 bg-[#10151F] space-y-3">
          <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF6B4A]" /> CodeChef Contests List ({displayList.length})
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {displayList.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-sm">
                <div>
                  <div className="font-bold text-xs text-[#E6EDF3]">{c.name}</div>
                  <div className="text-[10px] text-[#7C8797] font-mono mt-0.5">{c.date}</div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold font-mono">
                  <span>Rank #{c.rank}</span>
                  <span className="text-[#FF6B4A]">Rating: {c.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
