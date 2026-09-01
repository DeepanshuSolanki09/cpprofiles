'use client';

import React from 'react';
import { Trophy, Code2, Terminal, Cpu } from 'lucide-react';

export default function UnifiedContestView({ data, userProfiles }) {
  const lcData = data?.leetcode || {};
  const cfData = data?.codeforces || {};
  const ccData = data?.codechef || {};
  const atData = data?.atcoder || {};

  const cfRatingHist = Array.isArray(cfData.contest_history?.result)
    ? cfData.contest_history.result
    : Array.isArray(cfData.profile?.rating?.result)
    ? cfData.profile.rating.result
    : Array.isArray(cfData.rating?.result)
    ? cfData.rating.result
    : Array.isArray(cfData.ratingHistory)
    ? cfData.ratingHistory
    : [];
  const cfContestsCount = cfRatingHist.length;

  const ccRatingHist = Array.isArray(ccData.rating_history)
    ? ccData.rating_history
    : Array.isArray(ccData.contest_history)
    ? ccData.contest_history
    : Array.isArray(ccData.contests)
    ? ccData.contests
    : Array.isArray(ccData.profile?.rating_history)
    ? ccData.profile.rating_history
    : [];
  const ccContestsCount = ccRatingHist.length;

  const lcHist = lcData.contest_history || {};
  const lcPart = Array.isArray(lcHist.userContestRankingHistory)
    ? lcHist.userContestRankingHistory
    : Array.isArray(lcHist.contestParticipation)
    ? lcHist.contestParticipation
    : Array.isArray(lcHist.contestRatingHistogram)
    ? lcHist.contestRatingHistogram
    : [];

  const lcAttendedCount = lcHist.contestAttend || lcPart.filter((c) => c.attended !== false).length || 0;

  const atRatingHist = Array.isArray(atData.rating_history)
    ? atData.rating_history
    : Array.isArray(atData.contest_history)
    ? atData.contest_history
    : Array.isArray(atData.history)
    ? atData.history
    : Array.isArray(atData.contests)
    ? atData.contests
    : Array.isArray(atData.user_history)
    ? atData.user_history
    : [];
  const atContestsCount = atRatingHist.length;

  const allTimeline = [];

  cfRatingHist.forEach((c) => {
    const rawT = c.ratingUpdateTimeSeconds ? c.ratingUpdateTimeSeconds * 1000 : 0;
    allTimeline.push({
      platform: 'Codeforces',
      name: c.contestName || `Contest #${c.contestId || ''}`,
      rank: c.rank || 'N/A',
      ratingChange: (c.newRating !== undefined && c.oldRating !== undefined) ? c.newRating - c.oldRating : 0,
      newRating: c.newRating || 0,
      date: rawT ? new Date(rawT).toLocaleDateString() : 'Recent',
      rawTime: rawT,
      icon: <Terminal className="w-4 h-4 text-[#7C5CFF]" />,
      badgeBg: 'bg-[#7C5CFF]/15 border-[#7C5CFF]/30 text-[#7C5CFF]'
    });
  });

  ccRatingHist.forEach((c) => {
    const rawT = new Date(c.end_time || c.getdate || c.date || 0).getTime();
    allTimeline.push({
      platform: 'CodeChef',
      name: c.name || c.code || 'CodeChef Contest',
      rank: c.rank || 'N/A',
      ratingChange: Number(c.rating_change || c.change || 0),
      newRating: Number(c.rating || 0),
      date: !isNaN(rawT) && rawT > 0 ? new Date(rawT).toLocaleDateString() : 'Recent',
      rawTime: isNaN(rawT) ? 0 : rawT,
      icon: <Trophy className="w-4 h-4 text-[#FF6B4A]" />,
      badgeBg: 'bg-[#FF6B4A]/15 border-[#FF6B4A]/30 text-[#FF6B4A]'
    });
  });

  if (lcPart.length > 0) {
    lcPart
      .filter((c) => c.attended !== false)
      .forEach((c) => {
        const title = c.contest?.title || c.title || 'LeetCode Contest';
        const startTime = c.contest?.startTime || c.startTime || 0;
        const rating = Math.round(c.rating || c.ratingNumber || 0);
        allTimeline.push({
          platform: 'LeetCode',
          name: title,
          rank: c.ranking || c.rank || 'N/A',
          ratingChange: 0,
          newRating: rating,
          date: startTime ? new Date(startTime * 1000).toLocaleDateString() : 'Recent',
          rawTime: startTime * 1000,
          icon: <Code2 className="w-4 h-4 text-[#00FF9C]" />,
          badgeBg: 'bg-[#00FF9C]/15 border-[#00FF9C]/30 text-[#00FF9C]'
        });
      });
  }

  atRatingHist.forEach((c) => {
    const rawT = new Date(c.EndTime || c.endTime || c.date || 0).getTime();
    const oldR = c.OldRating !== undefined ? c.OldRating : c.oldRating !== undefined ? c.oldRating : 0;
    const newR = c.NewRating !== undefined ? c.NewRating : c.newRating !== undefined ? c.newRating : (c.Rating || c.rating || 0);
    allTimeline.push({
      platform: 'AtCoder',
      name: c.ContestName || c.contestName || c.ContestScreenName || 'AtCoder Contest',
      rank: c.Place || c.rank || 'N/A',
      ratingChange: newR - oldR,
      newRating: newR,
      date: !isNaN(rawT) && rawT > 0 ? new Date(rawT).toLocaleDateString() : 'Recent',
      rawTime: isNaN(rawT) ? 0 : rawT,
      icon: <Cpu className="w-4 h-4 text-[#00FF9C]" />,
      badgeBg: 'bg-[#00FF9C]/15 border-[#00FF9C]/30 text-[#00FF9C]'
    });
  });

  allTimeline.sort((a, b) => b.rawTime - a.rawTime);

  const calculatedSum = cfContestsCount + ccContestsCount + lcAttendedCount + atContestsCount;
  const totalContestsGiven = Math.max(calculatedSum, allTimeline.length);

  const cfInfo = Array.isArray(cfData.profile?.info?.result)
    ? cfData.profile.info.result[0]
    : cfData.info?.result?.[0] || {};
  const cfRating = cfInfo.rating || 0;
  const cfMaxRating = cfInfo.maxRating || 0;
  const cfRank = cfInfo.rank || 'Unrated';

  const ccRating = Number(ccData.rating) || 0;
  const ccHighest = Number(ccData.highest_rating) || ccRating;
  const ccStars = ccData.stars || 'N/A';

  const lcRating = Math.round(lcData.contest_history?.contestRating || 0);
  const lcRank = lcData.contest_history?.contestGlobalRanking ? `#${lcData.contest_history.contestGlobalRanking}` : 'N/A';

  const atRating = Number(atData.rating) || 0;
  const atHighest = atData.highest_rating || 'N/A';

  return (
    <div className="space-y-6 font-mono text-[#E6EDF3]">
      <div className="cyber-card p-6 bg-[#0D1219] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#00FF9C]/30 shadow-[0_0_30px_-5px_rgba(0,255,156,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A0E14] border border-[#00FF9C]/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_-4px_#00FF9C]">
            <Trophy className="w-7 h-7 text-[#00FF9C]" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#E6EDF3]">Unified Contest Dashboard</h3>
            <p className="text-xs text-[#7C8797]">Aggregated contest stats & ratings across competitive platforms</p>
          </div>
        </div>

        <div className="bg-[#0A0E14] border border-[#1F2733] rounded-lg px-5 py-2.5 text-center">
          <span className="text-[10px] text-[#7C8797] font-bold block uppercase tracking-widest">Total Contests</span>
          <span className="font-extrabold text-2xl text-[#00FF9C]">{totalContestsGiven}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <Terminal className="w-4 h-4 text-[#7C5CFF]" /> Codeforces
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#7C5CFF] rounded capitalize">{cfRank}</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest">Current Rating</div>
            <div className="text-2xl font-extrabold text-[#7C5CFF]">{cfRating > 0 ? cfRating : 'Unrated'}</div>
          </div>
          <div className="text-xs text-[#7C8797] font-mono pt-2 border-t border-[#1F2733] flex justify-between">
            <span>Max: {cfMaxRating > 0 ? cfMaxRating : 'N/A'}</span>
            <span>Contests: {cfContestsCount}</span>
          </div>
        </div>

        <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <Trophy className="w-4 h-4 text-[#FF6B4A]" /> CodeChef
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FF6B4A]/15 border border-[#FF6B4A]/30 text-[#FF6B4A] rounded">{ccStars}</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest">Current Rating</div>
            <div className="text-2xl font-extrabold text-[#FF6B4A]">{ccRating > 0 ? ccRating : 'Unrated'}</div>
          </div>
          <div className="text-xs text-[#7C8797] font-mono pt-2 border-t border-[#1F2733] flex justify-between">
            <span>Highest: {ccHighest > 0 ? ccHighest : 'N/A'}</span>
            <span>Contests: {ccContestsCount}</span>
          </div>
        </div>

        <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <Code2 className="w-4 h-4 text-[#00FF9C]" /> LeetCode
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00FF9C]/15 border border-[#00FF9C]/30 text-[#00FF9C] rounded">{lcRank}</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest">Contest Rating</div>
            <div className="text-2xl font-extrabold text-[#00FF9C]">{lcRating > 0 ? lcRating : 'Unrated'}</div>
          </div>
          <div className="text-xs text-[#7C8797] font-mono pt-2 border-t border-[#1F2733] flex justify-between">
            <span>Attended: {lcAttendedCount}</span>
          </div>
        </div>

        <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <Cpu className="w-4 h-4 text-[#00FF9C]" /> AtCoder
            </span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest">Rating</div>
            <div className="text-2xl font-extrabold text-[#00FF9C]">{atRating > 0 ? atRating : 'Unrated'}</div>
          </div>
          <div className="text-xs text-[#7C8797] font-mono pt-2 border-t border-[#1F2733] flex justify-between">
            <span>Highest: {atHighest}</span>
            <span>Contests: {atContestsCount}</span>
          </div>
        </div>
      </div>

      <div className="cyber-panel p-6 bg-[#10151F] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2733]">
          <h4 className="font-bold text-lg text-[#E6EDF3]">Merged Contest History</h4>
          <span className="text-xs font-bold text-[#7C8797] uppercase tracking-widest">{allTimeline.length} Total Logs</span>
        </div>

        {allTimeline.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {allTimeline.slice(0, 25).map((item, idx) => (
              <div key={idx} className="p-3 bg-[#0A0E14] border border-[#1F2733] rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${item.badgeBg}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#E6EDF3]">{item.name}</div>
                    <div className="text-[10px] text-[#7C8797]">{item.platform} • {item.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold font-mono">
                  <div>Rank #{item.rank}</div>
                  <div className="text-[#00FF9C]">Rating: {item.newRating}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[#7C8797] text-xs font-bold">
            No contest history found across platforms.
          </div>
        )}
      </div>
    </div>
  );
}
