/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, Star, ExternalLink, Folder } from 'lucide-react';

function CustomCCTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-gray-900 text-white p-3 rounded-xl border border-gray-700 shadow-xl font-fredoka text-xs space-y-1">
        <p className="font-lilita text-sm text-amber-400">{item.contest}</p>
        {item.date && <p className="text-gray-300">📅 Date: {item.date}</p>}
        <p className="text-orange-400 font-bold">🏆 Rating: {item.rating}</p>
        <p className="text-sky-300">📊 Rank: {item.rank}</p>
      </div>
    );
  }
  return null;
}

export default function PlatformDataView({ platformId, data, username, profileUrl }) {
  if (!username) {
    return (
      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-400 text-center font-fredoka text-gray-500 text-base">
        No username linked for this platform. Click &quot;Edit Profile&quot; above to connect your handle!
      </div>
    );
  }

  if (platformId === 'leetcode') {
    const lcData = data?.leetcode || {};
    const profile = lcData.profile || {};
    const contestHistory = lcData.contest_history || {};
    
    const contestList = Array.isArray(contestHistory.contestRatingHistogram)
      ? contestHistory.contestRatingHistogram
      : Array.isArray(contestHistory.contestHistory)
      ? contestHistory.contestHistory
      : Array.isArray(contestHistory)
      ? contestHistory
      : [];

    const chartData = contestList.map((item, idx) => ({
      name: item.contest?.title || item.contestName || `R${idx + 1}`,
      rating: item.rating || item.ratingNumber || item.newRating || 0,
    })).filter((c) => c.rating > 0);

    const totalSolved = profile.totalSolved || profile.solvedProblems || profile.matchedUser?.submitStats?.acSubmissionNum?.[0]?.count || 0;
    const rating = Math.round(contestHistory.rating || profile.rating || profile.contestRating || 0);
    const ranking = profile.ranking || profile.globalRanking || profile.matchedUser?.profile?.ranking || 0;

    return (
      <div className="space-y-6 font-fredoka text-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Solved Problems</span>
            <span className="font-lilita text-2xl text-amber-600">
              {totalSolved > 0 ? totalSolved : 'N/A'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Contest Rating</span>
            <span className="font-lilita text-2xl text-purple-600">
              {rating > 0 ? rating : 'Unrated'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Global Rank</span>
            <span className="font-lilita text-2xl text-sky-600">
              {ranking > 0 ? `#${ranking.toLocaleString()}` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <h4 className="font-lilita text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" /> LeetCode Contest Rating Progress
          </h4>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="lcColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rating" stroke="#D97706" strokeWidth={3} fillOpacity={1} fill="url(#lcColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No contest history returned from backend for user <span className="font-bold text-gray-700">{username}</span>.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (platformId === 'codeforces') {
    const cfData = data?.codeforces || {};
    const infoList = cfData?.profile?.info?.result || [];
    const userInfo = infoList[0] || {};
    const ratingHistory = Array.isArray(cfData?.contest_history?.result) ? cfData.contest_history.result : [];

    const chartData = ratingHistory.map((c, i) => ({
      name: c.contestName || `Contest ${i + 1}`,
      rating: c.newRating || 0,
    })).filter((c) => c.rating > 0);

    return (
      <div className="space-y-6 font-fredoka text-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Current Rating</span>
            <span className="font-lilita text-2xl text-sky-600">
              {userInfo.rating || 'Unrated'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Max Rating</span>
            <span className="font-lilita text-2xl text-purple-600">
              {userInfo.maxRating || 'N/A'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Rank / Title</span>
            <span className="font-lilita text-xl text-amber-600 capitalize">
              {userInfo.rank || 'N/A'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Contribution</span>
            <span className="font-lilita text-2xl text-emerald-600">
              {userInfo.contribution !== undefined ? userInfo.contribution : 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <h4 className="font-lilita text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-sky-600" /> Codeforces Rating History
          </h4>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cfColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rating" stroke="#0284C7" strokeWidth={3} fillOpacity={1} fill="url(#cfColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No contest history returned from Codeforces API for user <span className="font-bold text-gray-700">{username}</span>.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (platformId === 'github') {
    const ghData = data?.github || {};
    const ghProfile = ghData.profile || {};
    const repos = Array.isArray(ghData.repos) ? ghData.repos : [];

    return (
      <div className="space-y-6 font-fredoka text-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Public Repos</span>
            <span className="font-lilita text-2xl text-purple-600">
              {ghProfile.public_repos !== undefined ? ghProfile.public_repos : repos.length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Followers</span>
            <span className="font-lilita text-2xl text-sky-600">
              {ghProfile.followers !== undefined ? ghProfile.followers : 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Following</span>
            <span className="font-lilita text-2xl text-amber-600">
              {ghProfile.following !== undefined ? ghProfile.following : 0}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Public Gists</span>
            <span className="font-lilita text-2xl text-emerald-600">
              {ghProfile.public_gists !== undefined ? ghProfile.public_gists : 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <h4 className="font-lilita text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-purple-600" /> Public Code Repositories ({repos.length})
          </h4>
          {repos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {repos.slice(0, 8).map((repo, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-300 flex items-center justify-between">
                  <div>
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-900 text-sm hover:underline flex items-center gap-1">
                      {repo.name} <ExternalLink className="w-3 h-3 text-sky-600" />
                    </a>
                    <span className="text-xs text-gray-500 font-semibold">{repo.language || 'Code'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-gray-900">
                    <Star className="w-3 h-3 fill-amber-500" /> {repo.stargazers_count || 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              No public repositories returned from GitHub for handle <span className="font-bold text-gray-700">{username}</span>.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (platformId === 'codechef') {
    const ccData = data?.codechef || {};
    const rating = Number(ccData.rating || ccData.currentRating || ccData.current_rating) || 0;
    const highestRating = Number(ccData.highest_rating || ccData.highestRating) || rating;
    const stars = ccData.stars || 'N/A';
    const globalRank = ccData.global_rank || ccData.globalRank || 'N/A';
    const countryRank = ccData.country_rank || ccData.countryRank || 'N/A';
    const problemsSolved = ccData.problems_solved || ccData.problemsSolved || 0;
    const contestsGiven = ccData.contests_given || ccData.contestsGiven || (Array.isArray(ccData.contests) ? ccData.contests.length : 0);
    const profileName = ccData.name || ccData.username || username;
    const profileImg = ccData.profile_image || null;

    const contestList = Array.isArray(ccData.contests)
      ? ccData.contests
      : Array.isArray(ccData.contest_history)
      ? ccData.contest_history
      : Array.isArray(ccData.rating_history)
      ? ccData.rating_history
      : [];

    const chartData = contestList.map((c, idx) => ({
      contest: c.name || c.code || `Contest ${idx + 1}`,
      code: c.code || (c.name ? c.name.split(' ')[0] : `START${idx + 1}`),
      rating: Number(c.rating) || Number(c.getrating) || 0,
      rank: c.rank ? `#${c.rank}` : 'N/A',
      date: c.date ? c.date.split(' ')[0] : ''
    })).filter((c) => c.rating > 0);

    return (

      <div className="space-y-6 font-fredoka text-gray-800">
        <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {profileImg ? (
              <img
                src={profileImg}
                alt="CodeChef Avatar"
                className="w-12 h-12 rounded-xl border-2 border-gray-900 object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl border-2 border-gray-900 bg-orange-100 flex items-center justify-center font-lilita text-orange-600 text-lg">
                CC
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-lilita text-xl text-gray-900">{profileName}</span>
                {stars !== 'N/A' && (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-400 rounded-full font-bold text-xs">
                    {stars}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-semibold">@{ccData.username || username}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 font-bold block">Contests Given</span>
            <span className="font-lilita text-xl text-orange-600">{contestsGiven}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-[11px] text-gray-500 font-bold block">Current Rating</span>
            <span className="font-lilita text-xl text-orange-600">
              {rating > 0 ? rating : 'Unrated'}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-[11px] text-gray-500 font-bold block">Highest Rating</span>
            <span className="font-lilita text-xl text-purple-600">
              {highestRating > 0 ? highestRating : 'N/A'}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-[11px] text-gray-500 font-bold block">Star Rating</span>
            <span className="font-lilita text-xl text-amber-500">{stars}</span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-[11px] text-gray-500 font-bold block">Global Rank</span>
            <span className="font-lilita text-xl text-sky-600">
              {globalRank !== 'N/A' ? `#${globalRank}` : 'N/A'}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-[11px] text-gray-500 font-bold block">Country Rank</span>
            <span className="font-lilita text-xl text-emerald-600">
              {countryRank !== 'N/A' ? `#${countryRank}` : 'N/A'}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-[11px] text-gray-500 font-bold block">Problems Solved</span>
            <span className="font-lilita text-xl text-indigo-600">{problemsSolved}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <h4 className="font-lilita text-lg text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-600" /> CodeChef Rating Curve
            </span>
            <span className="text-xs text-gray-500 font-normal">
              {chartData.length} Rated Contests
            </span>
          </h4>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ccColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomCCTooltip />} />
                  <Area type="monotone" dataKey="rating" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#ccColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No rating history available for CodeChef handle <span className="font-bold text-gray-700">{username}</span>.
            </div>
          )}
        </div>

        {contestList.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm space-y-3">
            <h4 className="font-lilita text-lg text-gray-900 flex items-center gap-2">
              <span>Recent Contests</span>
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {contestList.map((c, idx) => (
                <div
                  key={c.code || idx}
                  className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-gray-200 text-sm"
                >
                  <div>
                    <div className="font-bold text-gray-900">{c.name || c.code}</div>
                    {c.date && <div className="text-xs text-gray-500">{c.date}</div>}
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    {c.rank && (
                      <span className="text-xs px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md font-bold">
                        Rank #{c.rank}
                      </span>
                    )}
                    <span className="font-lilita text-base text-orange-600">
                      {c.rating} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (platformId === 'atcoder') {
    const atData = data?.atcoder || {};
    const rating = atData.rating || 0;
    const contestList = Array.isArray(atData.history) ? atData.history : Array.isArray(atData.contest_history) ? atData.contest_history : [];

    const chartData = contestList.map((c, idx) => ({
      contest: c.IsRated ? c.ContestName || `Contest ${idx + 1}` : `ABC #${idx + 1}`,
      rating: c.NewRating || c.rating || 0
    })).filter((c) => c.rating > 0);

    return (
      <div className="space-y-6 font-fredoka text-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Current Rating</span>
            <span className="font-lilita text-2xl text-emerald-600">
              {rating > 0 ? rating : 'Unrated'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Color Band</span>
            <span className="font-lilita text-xl text-cyan-600 font-bold capitalize">
              {atData.color || (rating > 0 ? 'Rated' : 'Unrated')}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
            <span className="text-xs text-gray-500 font-bold block">Competitions</span>
            <span className="font-lilita text-2xl text-purple-600">
              {atData.competitions !== undefined ? atData.competitions : contestList.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <h4 className="font-lilita text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-600" /> AtCoder Contest Progress
          </h4>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="atColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="contest" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rating" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#atColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No rating history available for AtCoder handle <span className="font-bold text-gray-700">{username}</span>.
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
