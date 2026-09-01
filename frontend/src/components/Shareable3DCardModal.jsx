'use client';

import React, { useState, useRef } from 'react';
import { X, Download, Sparkles, Trophy, Terminal, Code2, Cpu, FolderGit, Zap } from 'lucide-react';
import { toPng } from 'html-to-image';
import { audioSynth } from '@/utils/audioSynth';

export default function Shareable3DCardModal({ isOpen, onClose, user, dashboardData }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  if (!isOpen || !user) return null;

  const lcData = dashboardData?.leetcode || {};
  const cfData = dashboardData?.codeforces || {};
  const ccData = dashboardData?.codechef || {};
  const atData = dashboardData?.atcoder || {};
  const ghData = dashboardData?.github || {};

  const lcSolved = lcData.profile?.totalSolved || 0;
  const lcRating = Math.round(lcData.contest_history?.contestRating || 0);

  const cfInfo = Array.isArray(cfData.profile?.info?.result)
    ? cfData.profile.info.result[0]
    : cfData.info?.result?.[0] || {};
  const cfRating = cfInfo.rating || 0;
  const cfMaxRating = cfInfo.maxRating || 0;
  const cfRank = cfInfo.rank || 'Unrated';

  const ccRating = Number(ccData.rating) || 0;
  const ccHighest = Number(ccData.highest_rating) || ccRating;
  const ccStars = ccData.stars || 'N/A';

  const atRating = Number(atData.rating) || 0;
  const atHighest = atData.highest_rating || 'N/A';

  const ghRepos = Array.isArray(ghData.repos) ? ghData.repos : [];
  const ghRepoCount = ghData.profile?.public_repos || ghRepos.length || 0;
  const ghStars = ghRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  const cfSubmissions = Array.isArray(cfData.profile?.status?.result) ? cfData.profile.status.result : [];
  const cfOKSet = new Set(cfSubmissions.filter((s) => s.verdict === 'OK').map((s) => `${s.problem?.contestId}-${s.problem?.index}`));
  const cfSolved = cfOKSet.size > 0 ? cfOKSet.size : 0;
  const ccSolved = Number(ccData.problems_solved) || 0;

  const grandTotalSolved = lcSolved + cfSolved + ccSolved;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX((-y / rect.height) * 15);
    setRotateY((x / rect.width) * 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    if (audioSynth) audioSynth.playPop();
    try {
      const currentTransform = cardRef.current.style.transform;
      cardRef.current.style.transform = 'none';

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#0A0E14'
      });

      cardRef.current.style.transform = currentTransform;

      const link = document.createElement('a');
      link.download = `${user.name.replace(/\s+/g, '_')}_CP_Hero_Card.png`;
      link.href = dataUrl;
      if (audioSynth) audioSynth.playFanfare();
    } catch (err) {
      console.error('Error generating card image:', err);
      if (audioSynth) audioSynth.playBonk();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0E14]/85 backdrop-blur-md animate-fadeIn overflow-y-auto font-mono text-[#E6EDF3]">
      <div className="flex flex-col items-center gap-6 max-w-xl w-full my-auto">
        <div className="w-full flex items-center justify-between text-[#E6EDF3]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00FF9C]" />
            <h2 className="font-bold text-xl">3D Shareable Member Card</h2>
          </div>
          <button
            onClick={() => {
              if (audioSynth) audioSynth.playPop();
              onClose();
            }}
            className="p-2 text-[#7C8797] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

                <div
          className="perspective-1000 w-full cursor-pointer flex justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={cardRef}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
            className="w-full max-w-md cyber-panel p-6 bg-[#10151F] border border-[#1F2733] shadow-[0_0_50px_-10px_#00FF9C] space-y-5 select-none relative"
          >
                        <div className="flex items-center justify-between gap-3 border-b border-[#1F2733] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#0A0E14] border border-[#00FF9C]/40 flex items-center justify-center text-3xl font-bold text-[#00FF9C]">
                  {user.profile_picture || '🐻'}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#E6EDF3] leading-tight">{user.name}</h3>
                  <span className="text-xs text-[#7C8797] font-mono">{user.email}</span>
                </div>
              </div>

              <div className="px-3 py-1 bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 rounded-full text-xs font-bold text-[#7C5CFF] uppercase tracking-wider">
                MEMBER CARD
              </div>
            </div>

                        <div className="bg-[#0A0E14] border border-[#00FF9C]/40 p-4 rounded-xl flex items-center justify-between shadow-[0_0_20px_-4px_#00FF9C]">
              <div>
                <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-wider block">Grand Total Solved</span>
                <span className="text-3xl font-bold text-[#00FF9C]">{grandTotalSolved}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#00FF9C]/10 border border-[#00FF9C]/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#00FF9C]" />
              </div>
            </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0A0E14] rounded-lg border border-[#1F2733] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#E6EDF3]">
                  <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#00FF9C]" /> Codeforces</span>
                </div>
                <div className="text-base font-bold text-[#00FF9C]">{cfRating > 0 ? cfRating : 'Unrated'}</div>
                <div className="text-[10px] text-[#7C8797]">Max: {cfMaxRating > 0 ? cfMaxRating : 'N/A'}</div>
              </div>

              <div className="p-3 bg-[#0A0E14] rounded-lg border border-[#1F2733] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#E6EDF3]">
                  <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-[#FF6B4A]" /> CodeChef</span>
                </div>
                <div className="text-base font-bold text-[#FF6B4A]">{ccRating > 0 ? ccRating : 'Unrated'}</div>
                <div className="text-[10px] text-[#7C8797]">Stars: {ccStars}</div>
              </div>

              <div className="p-3 bg-[#0A0E14] rounded-lg border border-[#1F2733] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#E6EDF3]">
                  <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-[#7C5CFF]" /> LeetCode</span>
                </div>
                <div className="text-base font-bold text-[#7C5CFF]">{lcSolved} Solved</div>
                <div className="text-[10px] text-[#7C8797]">Rating: {lcRating > 0 ? lcRating : 'Unrated'}</div>
              </div>

              <div className="p-3 bg-[#0A0E14] rounded-lg border border-[#1F2733] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#E6EDF3]">
                  <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-[#00FF9C]" /> AtCoder</span>
                </div>
                <div className="text-base font-bold text-[#00FF9C]">{atRating > 0 ? atRating : 'Unrated'}</div>
                <div className="text-[10px] text-[#7C8797]">Max: {atHighest}</div>
              </div>
            </div>

                        <div className="p-3 bg-[#0A0E14] rounded-lg border border-[#1F2733] flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-[#E6EDF3]">
                <FolderGit className="w-4 h-4 text-[#7C5CFF]" />
                <span>GitHub Repos: {ghRepoCount}</span>
              </div>
              <span className="text-[#00FF9C]">{ghStars} Stars</span>
            </div>

            <div className="pt-3 border-t border-[#1F2733] flex items-center justify-between text-[10px] font-bold text-[#7C8797] uppercase tracking-widest">
              <span>CP_PROFILES INTELLIGENCE HUB</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadImage}
          disabled={downloading}
          className="w-full py-3.5 btn-cyber text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Generating Card Image...' : 'Download 3D Member Card (PNG)'}</span>
        </button>
      </div>
    </div>
  );
}
