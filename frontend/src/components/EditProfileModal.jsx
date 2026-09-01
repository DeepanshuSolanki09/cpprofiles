'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { audioSynth } from '@/utils/audioSynth';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '') + '/users';

const AVATARS = [
  { id: 'bear', emoji: '🐻', label: 'Bear' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'robot', emoji: '🤖', label: 'Bot' },
  { id: 'bunny', emoji: '🐰', label: 'Bunny' },
];

export default function EditProfileModal({ isOpen, onClose, user, onUserUpdate }) {
  const [prevUserId, setPrevUserId] = useState(user?.id);
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    const matchAv = AVATARS.find((a) => a.emoji === user?.profile_picture);
    return matchAv ? matchAv.id : 'bear';
  });
  const [leetcodeUser, setLeetcodeUser] = useState(user?.profile?.leetcode_username || '');
  const [cfUser, setCfUser] = useState(user?.profile?.cf_username || '');
  const [codechefUser, setCodechefUser] = useState(user?.profile?.cc_username || '');
  const [atcoderUser, setAtcoderUser] = useState(user?.profile?.atcoder_username || '');
  const [githubUser, setGithubUser] = useState(user?.profile?.github_username || '');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setName(user?.name || '');
    const matchAv = AVATARS.find((a) => a.emoji === user?.profile_picture);
    setSelectedAvatar(matchAv ? matchAv.id : 'bear');
    const p = user?.profile || {};
    setLeetcodeUser(p.leetcode_username || '');
    setCfUser(p.cf_username || '');
    setCodechefUser(p.cc_username || '');
    setAtcoderUser(p.atcoder_username || '');
    setGithubUser(p.github_username || '');
  }

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSaving(true);
    if (audioSynth) audioSynth.playPop();

    const chosenEmoji = AVATARS.find((a) => a.id === selectedAvatar)?.emoji || '🐻';

    const payload = {
      name,
      profile_picture: chosenEmoji,
      profile: {
        leetcode_username: leetcodeUser || null,
        cf_username: cfUser || null,
        cc_username: codechefUser || null,
        atcoder_username: atcoderUser || null,
        github_username: githubUser || null,
      },
    };

    try {
      const res = await fetch(`${API_BASE}/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }

      onUserUpdate({
        ...user,
        name: data.name,
        profile_picture: data.profile_picture,
        profile: data.profile,
      });

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Server connection error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0E14]/85 backdrop-blur-md animate-fadeIn font-mono text-[#E6EDF3]">
      <div className="cyber-panel p-6 sm:p-8 max-w-lg w-full rounded-2xl relative bg-[#10151F]">
        <button
          onClick={() => {
            if (audioSynth) audioSynth.playPop();
            onClose();
          }}
          className="absolute top-5 right-5 text-[#7C8797] hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-[#E6EDF3] mb-1">Edit Hero Handles & Profile</h2>
        <p className="text-xs text-[#7C8797] mb-5 font-mono">
          Connect your competitive accounts to automatically aggregate live contest ratings & solved counts.
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-[#FF6B4A]/10 border border-[#FF6B4A]/40 rounded-lg flex items-center gap-2.5 text-[#FF6B4A] text-xs font-bold font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8797] mb-1.5">Avatar Badge</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`p-2 rounded-lg border text-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    selectedAvatar === av.id
                      ? 'bg-[#7C5CFF]/20 border-[#7C5CFF] text-[#E6EDF3] shadow-[0_0_12px_-2px_#7C5CFF]'
                      : 'bg-[#0A0E14] border-[#1F2733] text-[#7C8797] hover:border-[#7C8797]'
                  }`}
                >
                  <span>{av.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8797] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#00FF9C]"
            />
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1F2733]">
            <span className="text-[10px] text-[#7C8797] font-bold uppercase tracking-widest block">Platform Handles</span>

            <div>
              <label className="block text-[10px] font-bold text-[#7C8797] uppercase mb-0.5">LeetCode Username</label>
              <input
                type="text"
                placeholder="e.g. tourist"
                value={leetcodeUser}
                onChange={(e) => setLeetcodeUser(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#00FF9C]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7C8797] uppercase mb-0.5">Codeforces Username</label>
              <input
                type="text"
                placeholder="e.g. tourist"
                value={cfUser}
                onChange={(e) => setCfUser(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#00FF9C]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7C8797] uppercase mb-0.5">CodeChef Username</label>
              <input
                type="text"
                placeholder="e.g. tourist"
                value={codechefUser}
                onChange={(e) => setCodechefUser(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#00FF9C]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7C8797] uppercase mb-0.5">AtCoder Username</label>
              <input
                type="text"
                placeholder="e.g. tourist"
                value={atcoderUser}
                onChange={(e) => setAtcoderUser(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#00FF9C]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7C8797] uppercase mb-0.5">GitHub Username</label>
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0E14] border border-[#1F2733] rounded-lg text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#00FF9C]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2733]">
            <button
              type="button"
              onClick={() => {
                if (audioSynth) audioSynth.playPop();
                onClose();
              }}
              className="btn-cyber-dark px-4 py-2 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-cyber px-5 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
