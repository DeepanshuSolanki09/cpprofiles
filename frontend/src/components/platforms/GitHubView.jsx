'use client';

import React from 'react';
import { FolderGit, ExternalLink, Star, GitFork, BookOpen } from 'lucide-react';

export default function GitHubView({ data, username }) {
  if (!username) {
    return (
      <div className="cyber-card p-8 text-center text-[#7C8797] font-bold text-xs font-mono">
        No GitHub username linked. Click &quot;Edit Handles&quot; to connect your GitHub username!
      </div>
    );
  }

  const ghData = data?.github || {};
  const profile = ghData.profile || {};
  const repos = Array.isArray(ghData.repos) ? ghData.repos : [];

  const publicReposCount = profile.public_repos || repos.length || 0;
  const followersCount = profile.followers || 0;
  const totalStarsCount = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  return (
    <div className="space-y-6 font-mono text-[#E6EDF3]">
            <div className="cyber-card p-6 bg-[#0D1219] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#7C5CFF]/30 shadow-[0_0_30px_-5px_rgba(124,92,255,0.15)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A0E14] border border-[#7C5CFF]/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_-4px_#7C5CFF]">
            <FolderGit className="w-7 h-7 text-[#7C5CFF]" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-[#E6EDF3]">GitHub Overview</h3>
            <p className="text-xs text-[#7C8797]">@{username}</p>
          </div>
        </div>

        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cyber-purple px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Visit GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Public Repositories</span>
          <span className="text-3xl font-extrabold text-[#7C5CFF]">{publicReposCount}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Followers</span>
          <span className="text-3xl font-extrabold text-[#E6EDF3]">{followersCount}</span>
        </div>

        <div className="cyber-card p-4">
          <span className="text-[10px] font-bold text-[#7C8797] uppercase tracking-widest block">Total Stars</span>
          <span className="text-3xl font-extrabold text-[#00FF9C]">{totalStarsCount}</span>
        </div>
      </div>

            {repos.length > 0 && (
        <div className="cyber-panel p-6 bg-[#10151F] space-y-4">
          <h4 className="font-bold text-lg text-[#E6EDF3] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#7C5CFF]" /> Public Repositories ({repos.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <div key={repo.id} className="cyber-card p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sm text-[#E6EDF3] hover:text-[#00FF9C] flex items-center gap-1.5 transition-colors"
                    >
                      {repo.name} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  {repo.description && (
                    <p className="text-xs text-[#7C8797] line-clamp-2 font-sans font-normal">{repo.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-[#1F2733] font-mono">
                  <span className="text-[#7C5CFF]">{repo.language || 'Code'}</span>
                  <div className="flex items-center gap-3 text-[#7C8797]">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#00FF9C]" /> {repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {repo.forks_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
