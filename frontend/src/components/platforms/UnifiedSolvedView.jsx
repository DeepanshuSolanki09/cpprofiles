'use client';

import React from 'react';
import { CheckCircle2, Code2, Terminal, FolderGit, Trophy, Cpu, Zap, ExternalLink } from 'lucide-react';
import SubmissionHeatmap from '../SubmissionHeatmap';

export default function UnifiedSolvedView({ data }) {
  const lcData = data?.leetcode || {};
  const cfData = data?.codeforces || {};
  const ccData = data?.codechef || {};
  const ghData = data?.github || {};

  const lcSubmissions = Array.isArray(lcData.profile?.recentSubmissions)
    ? lcData.profile.recentSubmissions
    : Array.isArray(lcData.recentSubmissions)
    ? lcData.recentSubmissions
    : [];

  const cfSubmissions = Array.isArray(cfData.profile?.status?.result)
    ? cfData.profile.status.result
    : Array.isArray(cfData.status?.result)
    ? cfData.status.result
    : [];

  const combinedSubmissions = [...lcSubmissions, ...cfSubmissions];

  const lcSolved = lcData.profile?.totalSolved || 0;
  const lcEasy = lcData.profile?.easySolved || 0;
  const lcMedium = lcData.profile?.mediumSolved || 0;
  const lcHard = lcData.profile?.hardSolved || 0;

  const cfOKSet = new Set(
    cfSubmissions
      .filter((s) => s.verdict === 'OK')
      .map((s) => `${s.problem?.contestId}-${s.problem?.index}`)
  );
  const cfSolved = cfOKSet.size > 0 ? cfOKSet.size : 0;

  const ccSolved = Number(ccData.problems_solved) || 0;

  const ghRepos = Array.isArray(ghData.repos) ? ghData.repos : [];
  const ghRepoCount = ghData.profile?.public_repos || ghRepos.length || 0;

  const grandTotalSolved = lcSolved + cfSolved + ccSolved;

  return (
    <div className="space-y-6 font-mono text-[#E6EDF3]">
            <div className="cyber-card p-6 bg-[#0D1219] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#00FF9C]/30 shadow-[0_0_30px_-5px_rgba(0,255,156,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A0E14] border border-[#00FF9C]/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_-4px_#00FF9C]">
            <Zap className="w-7 h-7 text-[#00FF9C]" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#E6EDF3]">Problems Solved Dashboard</h3>
            <p className="text-xs text-[#7C8797]">Total verified problem solves & codebase projects across all platforms</p>
          </div>
        </div>

        <div className="bg-[#0A0E14] border border-[#1F2733] rounded-lg px-5 py-2.5 text-center">
          <span className="text-[10px] text-[#7C8797] font-bold block uppercase tracking-widest">Grand Total Solved</span>
          <span className="font-extrabold text-3xl text-[#00FF9C]">{grandTotalSolved}</span>
        </div>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <Code2 className="w-4 h-4 text-[#00FF9C]" /> LeetCode
            </span>
            <span className="font-extrabold text-xl text-[#00FF9C]">{lcSolved}</span>
          </div>
          <div className="space-y-1.5 text-xs font-bold font-mono pt-2 border-t border-[#1F2733]">
            <div className="flex justify-between">
              <span>Easy:</span>
              <span className="text-[#00FF9C]">{lcEasy}</span>
            </div>
            <div className="flex justify-between">
              <span>Medium:</span>
              <span className="text-[#7C5CFF]">{lcMedium}</span>
            </div>
            <div className="flex justify-between">
              <span>Hard:</span>
              <span className="text-[#FF6B4A]">{lcHard}</span>
            </div>
          </div>
        </div>

                <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <Terminal className="w-4 h-4 text-[#7C5CFF]" /> Codeforces
            </span>
            <span className="font-extrabold text-xl text-[#7C5CFF]">{cfSolved}</span>
          </div>
          <p className="text-xs text-[#7C8797] font-mono pt-2 border-t border-[#1F2733]">
            Verified unique AC verdicts calculated directly from Codeforces submission status logs.
          </p>
        </div>

                <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <Trophy className="w-4 h-4 text-[#FF6B4A]" /> CodeChef
            </span>
            <span className="font-extrabold text-xl text-[#FF6B4A]">{ccSolved}</span>
          </div>
          <p className="text-xs text-[#7C8797] font-mono pt-2 border-t border-[#1F2733]">
            Fully solved practice & contest problems verified from CodeChef API profile.
          </p>
        </div>

                <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5 text-[#E6EDF3]">
              <FolderGit className="w-4 h-4 text-[#00FF9C]" /> GitHub
            </span>
            <span className="font-extrabold text-xl text-[#00FF9C]">{ghRepoCount}</span>
          </div>
          <p className="text-xs text-[#7C8797] font-mono pt-2 border-t border-[#1F2733]">
            Public open-source repositories and codebase projects published on GitHub.
          </p>
        </div>
      </div>

            <SubmissionHeatmap
        submissions={combinedSubmissions}
        colorTheme="gold"
        title="Unified Cross-Platform Heatmap (Codeforces + LeetCode)"
      />
    </div>
  );
}
