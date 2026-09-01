'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ToonBuddy({
  mood = 'idle',
  cursorPos = 0,
  showPassword = false,
  accessory = 'none',
  speechText = ''
}) {
  const containerRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftPawRef = useRef(null);
  const rightPawRef = useRef(null);
  const headRef = useRef(null);
  const mouthRef = useRef(null);
  const sweatRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (mood === 'blindfold' || mood === 'dizzy') return;

      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const mascotCenterX = bounds.left + bounds.width / 2;
      const mascotCenterY = bounds.top + bounds.height / 2;

      const dx = (e.clientX - mascotCenterX) / (window.innerWidth / 2);
      const dy = (e.clientY - mascotCenterY) / (window.innerHeight / 2);

      const maxOffset = 5;
      const offsetX = Math.max(-maxOffset, Math.min(maxOffset, dx * maxOffset));
      const offsetY = Math.max(-maxOffset, Math.min(maxOffset, dy * maxOffset));

      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x: offsetX,
        y: offsetY,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mood]);

  useEffect(() => {
    if (cursorPos > 0 && mood !== 'blindfold' && mood !== 'dizzy') {
      const offsetX = Math.min(6, (cursorPos % 15) - 3);
      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x: offsetX,
        y: 2,
        duration: 0.15,
        ease: 'power1.out'
      });
    }
  }, [cursorPos, mood]);

  useEffect(() => {
    if (!headRef.current || !leftPawRef.current || !rightPawRef.current) return;

    if (mood === 'blindfold') {
      gsap.to(leftPawRef.current, { y: -45, x: 22, rotation: -20, duration: 0.4, ease: 'back.out(1.7)' });
      gsap.to(rightPawRef.current, { y: -45, x: -22, rotation: 20, duration: 0.4, ease: 'back.out(1.7)' });
      gsap.to(headRef.current, { y: 0, rotation: 0, duration: 0.3 });
    } else if (mood === 'peek') {
      gsap.to(leftPawRef.current, { y: -30, x: 18, rotation: -10, duration: 0.3, ease: 'power2.out' });
      gsap.to(rightPawRef.current, { y: -30, x: -18, rotation: 10, duration: 0.3, ease: 'power2.out' });
      gsap.to(headRef.current, { rotation: 4, duration: 0.3 });
    } else if (mood === 'cheer') {
      gsap.to([leftPawRef.current, rightPawRef.current], { y: 0, x: 0, rotation: 0, duration: 0.3 });
      gsap.fromTo(headRef.current, 
        { y: 0 },
        { y: -18, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }
      );
    } else if (mood === 'shock') {
      gsap.to([leftPawRef.current, rightPawRef.current], { y: 10, x: 0, rotation: 0, duration: 0.2 });
      gsap.fromTo(headRef.current, 
        { x: -8 },
        { x: 8, duration: 0.08, repeat: 5, yoyo: true, ease: 'rough' }
      );
      if (sweatRef.current) {
        gsap.fromTo(sweatRef.current, { opacity: 0, y: -5, scale: 0.5 }, { opacity: 1, y: 5, scale: 1, duration: 0.3 });
      }
    } else if (mood === 'dizzy') {
      gsap.to([leftPawRef.current, rightPawRef.current], { y: 0, x: 0, rotation: 0, duration: 0.3 });
      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        rotation: 360,
        duration: 0.8,
        repeat: -1,
        ease: 'none'
      });
    } else {
      gsap.to([leftPawRef.current, rightPawRef.current], { y: 0, x: 0, rotation: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(headRef.current, { x: 0, y: 0, rotation: 0, duration: 0.3 });
      if (sweatRef.current) {
        gsap.to(sweatRef.current, { opacity: 0, duration: 0.2 });
      }
    }
  }, [mood, showPassword]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center -mb-6 z-20">
      {speechText && (
        <div className="absolute -top-12 bg-white text-gray-800 border-2 border-gray-900 font-fredoka text-sm px-4 py-1.5 rounded-2xl soft-comic-shadow speech-bubble animate-bounce">
          {speechText}
        </div>
      )}

      <svg width="150" height="150" viewBox="0 0 160 160" className="overflow-visible select-none drop-shadow-md">
        <defs>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="3" dy="4" stdDeviation="0" floodColor="#1A202C" />
          </filter>
        </defs>

        <g ref={headRef} filter="url(#softShadow)">
          <ellipse cx="80" cy="85" rx="55" ry="48" fill="#FFD93D" stroke="#1A202C" strokeWidth="3.5" />

          <g>
            <circle cx="35" cy="45" r="18" fill="#FFD93D" stroke="#1A202C" strokeWidth="3.5" />
            <circle cx="35" cy="45" r="10" fill="#FF6B6B" opacity="0.8" />
          </g>
          <g>
            <circle cx="125" cy="45" r="18" fill="#FFD93D" stroke="#1A202C" strokeWidth="3.5" />
            <circle cx="125" cy="45" r="10" fill="#FF6B6B" opacity="0.8" />
          </g>

          <circle cx="48" cy="92" r="8" fill="#FF8E8E" opacity="0.6" />
          <circle cx="112" cy="92" r="8" fill="#FF8E8E" opacity="0.6" />

          <ellipse cx="80" cy="95" rx="22" ry="16" fill="#FFF9E6" stroke="#1A202C" strokeWidth="2.5" />

          <ellipse cx="80" cy="88" rx="7" ry="5" fill="#1A202C" />

          <g ref={mouthRef}>
            {mood === 'cheer' ? (
              <path d="M 70 94 Q 80 108 90 94 Z" fill="#FF6B6B" stroke="#1A202C" strokeWidth="2" />
            ) : mood === 'shock' ? (
              <ellipse cx="80" cy="98" rx="5" ry="7" fill="#1A202C" />
            ) : (
              <path d="M 72 94 Q 76 99 80 95 Q 84 99 88 94" fill="none" stroke="#1A202C" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>

          <g transform="translate(56, 68)">
            <ellipse cx="0" cy="0" rx="12" ry="14" fill="#FFFFFF" stroke="#1A202C" strokeWidth="3" />
            {mood === 'peek' && (
              <path d="M -12 -5 Q 0 4 12 -5 Z" fill="#FFD93D" stroke="#1A202C" strokeWidth="2" />
            )}
            <g ref={leftPupilRef}>
              <circle cx="0" cy="0" r="5.5" fill="#1A202C" />
              <circle cx="-2" cy="-2" r="2" fill="#FFFFFF" />
            </g>
          </g>

          <g transform="translate(104, 68)">
            <ellipse cx="0" cy="0" rx="12" ry="14" fill="#FFFFFF" stroke="#1A202C" strokeWidth="3" />
            {mood === 'peek' && (
              <path d="M -12 -5 Q 0 4 12 -5 Z" fill="#FFD93D" stroke="#1A202C" strokeWidth="2" />
            )}
            <g ref={rightPupilRef}>
              <circle cx="0" cy="0" r="5.5" fill="#1A202C" />
              <circle cx="-2" cy="-2" r="2" fill="#FFFFFF" />
            </g>
          </g>

          <g ref={sweatRef} className="opacity-0" transform="translate(125, 65)">
            <path d="M 0 -8 Q 6 0 0 8 Q -6 0 0 -8 Z" fill="#4D96FF" stroke="#1A202C" strokeWidth="1.5" />
          </g>

          {accessory === 'party_hat' && (
            <g transform="translate(80, 30)">
              <polygon points="0,-35 -18,10 18,10" fill="#FF6B6B" stroke="#1A202C" strokeWidth="2.5" />
              <circle cx="0" cy="-35" r="5" fill="#4D96FF" />
            </g>
          )}

          {accessory === 'crown' && (
            <g transform="translate(80, 32)">
              <path d="M -22 5 L -18 -20 L -6 -5 L 0 -25 L 6 -5 L 18 -20 L 22 5 Z" fill="#FFD93D" stroke="#1A202C" strokeWidth="2.5" />
              <circle cx="0" cy="-12" r="3" fill="#FF6B6B" />
              <circle cx="-14" cy="-10" r="2.5" fill="#4D96FF" />
              <circle cx="14" cy="-10" r="2.5" fill="#6BCB77" />
            </g>
          )}

          {accessory === 'shades' && (
            <g transform="translate(80, 68)">
              <rect x="-32" y="-10" width="28" height="18" rx="4" fill="#1A202C" stroke="#1A202C" strokeWidth="2" />
              <rect x="4" y="-10" width="28" height="18" rx="4" fill="#1A202C" stroke="#1A202C" strokeWidth="2" />
              <line x1="-4" y1="-4" x2="4" y2="-4" stroke="#1A202C" strokeWidth="3" />
              <line x1="-25" y1="-4" x2="-15" y2="4" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
              <line x1="11" y1="-4" x2="21" y2="4" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
            </g>
          )}

          {accessory === 'ninja' && (
            <g transform="translate(80, 58)">
              <rect x="-42" y="-12" width="84" height="18" rx="3" fill="#1A202C" />
              <circle cx="0" cy="-3" r="5" fill="#FF6B6B" />
            </g>
          )}

          <g ref={leftPawRef} transform="translate(45, 125)">
            <ellipse cx="0" cy="0" rx="14" ry="12" fill="#FFD93D" stroke="#1A202C" strokeWidth="3" />
            <ellipse cx="0" cy="2" rx="7" ry="5" fill="#FFF9E6" />
          </g>

          <g ref={rightPawRef} transform="translate(115, 125)">
            <ellipse cx="0" cy="0" rx="14" ry="12" fill="#FFD93D" stroke="#1A202C" strokeWidth="3" />
            <ellipse cx="0" cy="2" rx="7" ry="5" fill="#FFF9E6" />
          </g>
        </g>
      </svg>
    </div>
  );
}
