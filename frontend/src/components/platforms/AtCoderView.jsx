'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Cpu, ExternalLink, Trophy, Clock } from 'lucide-react';

function CustomAtTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0A0E14] text-[#E6EDF3] p-3 rounded-lg border border-[#00FF9C]/40 shadow-[0_0_20px_-4px_#00FF9C] font-mono text-xs space-y-1 max-w-xs">
        <p className="font-bold text-sm text-[#00FF9C]">{item.name}</p>
        <p className="text-[#00FF9C] font-bold">🏆 Rating: {item.rating}</p>
        <p className="text-[#E6EDF3]">📊 Rank: #{item.rank}</p>
        {item.performance !== undefined && item.performance !== 'N/A' && (
          <p className="text-[#7C5CFF]">⚡ Performance: {item.performance}</p>
        )}
        <p className="text-[#7C8797] text-[10px]">{item.date}</p>
      </div>
    );
  }
  return null;
}

export default function AtCoderView({ data, username }) {
  if (!username) {
    return (
      <div className="cyber-card p-8 text-center text-[#7C8797] font-bold text-xs font-mono">
        No AtCoder handle linked. Click &quot;Edit Handles&quot; to connect your AtCoder username!
      </div>
    );
  }

  const atData = data?.atcoder || {};
  const rating = Number(atData.rating) || 0;
  const highestRating = atData.highest_rating || 'N/A';

  const ratingHistory = Array.isArray(atData.contests)
    ? atData.contests
    : Array.isArray(atData.rating_history)
    ? atData.rating_history
    : Array.isArray(atData.contest_history)
    ? atData.contest_history
    : Array.isArray(atData.history)
    ? atData.history
    : Array.isArray(atData.ratingHistory)
    ? atData.ratingHistory
    : Array.isArray(atData.data)
    ? atData.data
    : Array.isArray(atData.results)
    ? atData.results
    : Array.isArray(atData.ratings)
    ? atData.ratings
    : Array.isArray(atData.user_history)
    ? atData.user_history
    : [];

  const rawChartData = ratingHistory.map((item, idx) => {
    const rVal = item.new_rating !== undefined
      ? Number(item.new_rating)
      : item.NewRating !== undefined
      ? Number(item.NewRating)
      : item.newRating !== undefined
      ? Number(item.newRating)
      : item.Rating !== undefined
      ? Number(item.Rating)
      : item.rating !== undefined
      ? Number(item.rating)
      : 0;

    const contestTitle = item.contest_name || item.ContestName || item.contestName || item.ContestScreenName || `Contest #${idx + 1}`;

    const shortTitle = item.ContestScreenName
      ? item.ContestScreenName.toUpperCase()
      : contestTitle.length > 18
      ? `${contestTitle.slice(0, 16)}..`
      : contestTitle;

    const rawDate = item.date || item.EndTime || item.endTime || '';
    const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString() : 'Recent';

    return {
      name: contestTitle,
      shortName: shortTitle,
      rating: isNaN(rVal) ? 0 : rVal,
      rank: item.rank || item.Place || item.place || 'N/A',
      performance: item.performance !== undefined ? item.performance : 'N/A',
      date: formattedDate
    };
  });

  const chartData = rawChartData.filter((d) => d.rating > 0);
  const displayList = chartData.length > 0 ? chartData : rawChartData;

  return (
    <div className="space-y-6 font-mono text-[#E6EDF3]">
            <div className="cyber-card p-6 bg-[#0D1219] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#00FF9C]/30 shadow-[0_0_30px_-5px_rgba(0,255,156,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A0E14] border border-[#00FF9C]/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_-4px_#00FF9C]">
            <Cpu className="w-7 h-7 text-[#00FF9C]" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#E6EDF3]">AtCoder Overview</h3>
            <p className="text-xs text-[#7C8797]">@{username}</p>
          </div>
        </div>

        <a
          href={`https://atcoder.jp/users/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cyber px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Visit AtCoder</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Current Rating</span>
          <span className="text-3xl font-extrabold text-[#00FF9C]">{rating > 0 ? rating : 'Unrated'}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Highest Rating</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">{highestRating}</span>
        </div>
      </div>

            <div className="cyber-panel p-6 bg-[#10151F] space-y-4">
        <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00FF9C]" /> AtCoder Rating History
          </span>
          <span className="text-xs text-[#7C8797] font-normal">Contests: {displayList.length}</span>
        </h4>
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2733" opacity={0.5} />
                <XAxis dataKey="shortName" tick={{ fontSize: 10, fill: '#7C8797' }} />
                <YAxis domain={['dataMin - 30', 'dataMax + 30']} tick={{ fontSize: 11, fill: '#7C8797' }} />
                <Tooltip content={<CustomAtTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="#00FF9C"
                  strokeWidth={3}
                  fill="#00FF9C"
                  fillOpacity={0.2}
                  dot={{ r: 4, fill: '#00FF9C', stroke: '#0A0E14', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-[#7C8797] text-xs font-bold">
            No contest rating graph points available for AtCoder handle <span className="text-[#00FF9C]">{username}</span>.
          </div>
        )}
      </div>

            {displayList.length > 0 && (
        <div className="cyber-panel p-6 bg-[#10151F] space-y-3">
          <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00FF9C]" /> AtCoder Contests List ({displayList.length})
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {displayList.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-sm">
                <div>
                  <div className="font-bold text-xs text-[#E6EDF3]">{c.name}</div>
                  <div className="text-[10px] text-[#7C8797] font-mono mt-0.5">{c.date}</div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold font-mono">
                  <span>Rank #{c.rank}</span>
                  <span className="text-[#00FF9C]">Rating: {c.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
