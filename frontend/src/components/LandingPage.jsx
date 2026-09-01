'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Code2, Zap, Crown, Flame, Lock, CheckCircle2,
  Terminal, Sparkles, Trophy, LineChart, Cpu, Globe2, Layers, Play, Star,
  TrendingUp, Users, RefreshCw, BarChart3, ChevronRight, FolderGit, Share2,
  Download, Copy, Check, ShieldCheck, Mail, ExternalLink, RefreshCcw
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as htmlToImage from 'html-to-image';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function InteractivePhysicsCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const badgeTexts = [
      { text: 'Codeforces', color: '#FFD700', bg: '#141204' },
      { text: 'LeetCode', color: '#E6C200', bg: '#0F0D03' },
      { text: 'CodeChef', color: '#FFD700', bg: '#141204' },
      { text: 'GitHub', color: '#F5D000', bg: '#121003' },
      { text: 'AtCoder', color: '#FFD700', bg: '#141204' },
      { text: 'Algorithms', color: '#E6C200', bg: '#0F0D03' },
      { text: 'Data Structures', color: '#FFD700', bg: '#141204' },
      { text: 'Competitive Prog.', color: '#F5D000', bg: '#121003' },
      { text: 'AI Coach', color: '#FFD700', bg: '#141204' }
    ];

    const particles = badgeTexts.map((item) => ({
      x: Math.random() * (width - 160) + 80,
      y: Math.random() * (height - 100) + 50,
      vx: (Math.random() - 0.5) * 1.8,
      vy: (Math.random() - 0.5) * 1.8,
      floatAngle: Math.random() * Math.PI * 2,
      floatSpeed: 0.02 + Math.random() * 0.02,
      width: 145,
      height: 40,
      text: item.text,
      color: item.color,
      bg: item.bg,
      isDragging: false,
      angle: (Math.random() - 0.5) * 0.2
    }));

    let mouse = { x: -1000, y: -1000, isDown: false, draggedParticle: null, offsetX: 0, offsetY: 0 };

    const onMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouse.x = mx;
      mouse.y = my;
      mouse.isDown = true;

      for (let p of particles) {
        if (
          mx >= p.x - p.width / 2 &&
          mx <= p.x + p.width / 2 &&
          my >= p.y - p.height / 2 &&
          my <= p.y + p.height / 2
        ) {
          p.isDragging = true;
          mouse.draggedParticle = p;
          mouse.offsetX = mx - p.x;
          mouse.offsetY = my - p.y;
          break;
        }
      }
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      if (mouse.draggedParticle) {
        mouse.draggedParticle.vx = (mouse.x - mouse.offsetX - mouse.draggedParticle.x) * 0.3;
        mouse.draggedParticle.vy = (mouse.y - mouse.offsetY - mouse.draggedParticle.y) * 0.3;
        mouse.draggedParticle.x = mouse.x - mouse.offsetX;
        mouse.draggedParticle.y = mouse.y - mouse.offsetY;
      }
    };

    const onMouseUp = () => {
      if (mouse.draggedParticle) {
        mouse.draggedParticle.isDragging = false;
        mouse.draggedParticle = null;
      }
      mouse.isDown = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const bounce = 0.9;
    const damping = 0.99;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      particles.forEach((p, i) => {
        if (!p.isDragging) {
          p.floatAngle += p.floatSpeed;
          p.vx += Math.cos(p.floatAngle) * 0.04;
          p.vy += Math.sin(p.floatAngle) * 0.04;

          p.vx *= damping;
          p.vy *= damping;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x - p.width / 2 < 15) {
            p.x = 15 + p.width / 2;
            p.vx *= -bounce;
          } else if (p.x + p.width / 2 > width - 15) {
            p.x = width - 15 - p.width / 2;
            p.vx *= -bounce;
          }

          if (p.y - p.height / 2 < 15) {
            p.y = 15 + p.height / 2;
            p.vy *= -bounce;
          } else if (p.y + p.height / 2 > height - 15) {
            p.y = height - 15 - p.height / 2;
            p.vy *= -bounce;
          }

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (p.width + p2.width) / 2.7;

            if (dist < minDist && dist > 0) {
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              p.x -= nx * overlap * 0.5;
              p.y -= ny * overlap * 0.5;
              p2.x += nx * overlap * 0.5;
              p2.y += ny * overlap * 0.5;

              const tempVx = p.vx;
              const tempVy = p.vy;
              p.vx = p2.vx * bounce;
              p.vy = p2.vy * bounce;
              p2.vx = tempVx * bounce;
              p2.vy = tempVy * bounce;
            }
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + Math.sin(p.floatAngle) * 0.05);

        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = p.isDragging ? 28 : 14;

        ctx.fillStyle = p.bg;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = p.isDragging ? 2.5 : 1.5;

        ctx.beginPath();
        const rw = p.width;
        const rh = p.height;
        const rr = rh / 2;
        ctx.roundRect(-rw / 2, -rh / 2, rw, rh, rr);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, 0, 0);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />;
}

function RotatingWireframeGlobe({ onSelectMarker }) {
  const globeGroupRef = useRef();

  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.15;
    }
  });

  const markers = [
    {
      pos: [1.2, 0.8, 1.2],
      title: 'Platform Hub Live Sync',
      problem: 'Coders manually update spreadsheets across Codeforces, LeetCode, CodeChef, AtCoder & GitHub.',
      solution: 'Automated 1-click live API sync aggregates contest ratings, solve counts & submission heatmaps.',
      color: '#FFD700'
    },
    {
      pos: [-1.4, 0.5, 1.0],
      title: 'AI Weakness Radar',
      problem: 'Difficulty pinpointing exact algorithmic weaknesses (Dynamic Programming, Segment Trees, Graphs).',
      solution: 'AI vector similarity search analyzes submission failures & generates targeted practice tasks.',
      color: '#E6C200'
    },
    {
      pos: [0.3, -1.3, 1.3],
      title: 'Shareable 3D Card Modal',
      problem: 'No standard verified format to showcase competitive coding stats on LinkedIn, resume, or GitHub.',
      solution: 'Exportable 3D tilt cards with custom neon stats, anti-spoof verification & 1-click PNG downloads.',
      color: '#FFD700'
    },
    {
      pos: [-0.9, -1.0, -1.2],
      title: 'Global Verified Leaderboard',
      problem: 'Unclear global standing and handle spoofing on unverified community tracking sites.',
      solution: 'Cryptographically verified leaderboard tracking real-time global rank across all 5 platforms.',
      color: '#F5D000'
    }
  ];

  return (
    <group ref={globeGroupRef}>
      <Sphere args={[2, 28, 28]}>
        <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.25} />
      </Sphere>

      <Sphere args={[1.8, 16, 16]}>
        <meshBasicMaterial color="#FFD700" transparent opacity={0.05} />
      </Sphere>

      {markers.map((m, idx) => (
        <group key={idx} position={m.pos}>
          <mesh onClick={() => onSelectMarker(m)}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <mesh onClick={() => onSelectMarker(m)}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function LandingPage({ onGoToAuth }) {
  const [selectedGlobeMarker, setSelectedGlobeMarker] = useState({
    title: 'Platform Hub Live Sync',
    problem: 'Coders manually update spreadsheets across Codeforces, LeetCode, CodeChef, AtCoder & GitHub.',
    solution: 'Automated 1-click live API sync aggregates contest ratings, solve counts & submission heatmaps.',
    color: '#FFD700'
  });

  const [activeTab, setActiveTab] = useState('home');
  const [copiedCard, setCopiedCard] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);

  const [cardStats, setCardStats] = useState({
    cfRating: '2140',
    lcSolved: '840',
    ccStars: '6-Star',
    globalRank: '#412'
  });

  const [liveStats, setLiveStats] = useState({
    coders: '5+',
    problems: '4,033+',
    platforms: '5'
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '') + '/users';
        const res = await fetch(`${apiBase}/public-stats`);
        if (res.ok) {
          const data = await res.json();
          setLiveStats({
            coders: data.active_coders > 0 ? `${data.active_coders}` : '5+',
            problems: data.total_problems > 0 ? `${data.total_problems.toLocaleString()}+` : '4,033+',
            platforms: '5'
          });
        }
      } catch (err) {
        console.warn('Could not fetch public stats', err);
      }
    };

    fetchPublicStats();
  }, []);

  const maskOverlayRef = useRef(null);
  const maskBoxRef = useRef(null);

  const cardRef = useRef(null);
  const heroTextRef = useRef(null);
  const navbarRef = useRef(null);
  const iconsContainerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 8;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loadingProgress < 100) return;

    const tl = gsap.timeline({
      onComplete: () => setIsLoaderFinished(true)
    });

    tl.to(maskBoxRef.current, {
      rotate: 90,
      scale: 1.1,
      duration: 0.7,
      ease: 'power3.inOut'
    })
    .to(maskBoxRef.current, {
      scale: 35,
      opacity: 0,
      duration: 1.1,
      ease: 'power4.inOut'
    }, '-=0.1')
    .to(maskOverlayRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.3
    }, '-=0.5')
    .fromTo(navbarRef.current, {
      y: -60,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'back.out(1.5)'
    }, '-=0.4')
    .fromTo(heroTextRef.current.children, {
      opacity: 0,
      y: 40,
      scale: 0.9
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.12,
      ease: 'back.out(1.4)'
    }, '-=0.4')
    .fromTo('.main-hero-icon', {
      scale: 0,
      opacity: 0,
      rotate: -45
    }, {
      scale: 1,
      opacity: 1,
      rotate: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(2)'
    }, '-=0.4');

    const sections = document.querySelectorAll('.anim-section');
    sections.forEach((sec) => {
      gsap.fromTo(
        sec,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

  }, [loadingProgress]);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = 'CP_PROFILES_Progress_Card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card image:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-[#FFD700] font-sans selection:bg-[#FFD700] selection:text-black relative overflow-hidden">

            {!isLoaderFinished && (
        <div
          ref={maskOverlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl pointer-events-auto overflow-hidden selection:bg-none"
        >
                    <div className="absolute inset-0 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

                    <div
            ref={maskBoxRef}
            className="relative w-80 h-80 rounded-3xl bg-black/90 border border-[#FFD700]/50 shadow-[0_0_100px_rgba(255,215,0,0.25)] flex flex-col items-center justify-center p-6 space-y-5 overflow-hidden group"
          >
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD700]/20 via-amber-500/10 to-[#FFD700]/20 blur-xl opacity-60 animate-pulse" />

                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFD700]/40 animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#FFD700] border-r-[#FFD700]/60 animate-spin" />
                            <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-[#FFD700] border-l-[#FFD700]/40 animate-[spin_3s_linear_infinite_reverse]" />
              
                            <div className="relative z-10 p-2.5 rounded-xl bg-black/80 border border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <Code2 className="w-7 h-7 text-[#FFD700] animate-pulse" />
              </div>
            </div>

                        <div className="flex flex-col items-center space-y-1 z-10 text-center">
              <div className="flex items-center gap-1.5 text-lg font-black tracking-wider text-white">
                <span>CP</span>
                <span className="text-[#FFD700] shadow-[#FFD700]/50 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">_PROFILES</span>
              </div>
              <div className="text-3xl font-extrabold text-[#FFD700] font-mono tracking-tighter drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
                {Math.min(100, loadingProgress)}<span className="text-xs text-[#FFD700]/70 ml-0.5">%</span>
              </div>
            </div>

                        <div className="w-full max-w-[200px] z-10 space-y-2">
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-[#FFD700]/20 p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-[#FFD700] to-yellow-200 rounded-full transition-all duration-150 ease-out shadow-[0_0_10px_#FFD700]"
                  style={{ width: `${Math.min(100, loadingProgress)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-[#FFD700]/70">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-ping" />
                  {loadingProgress < 40 ? 'Connecting APIs...' : loadingProgress < 85 ? 'Fetching Stats...' : 'Ready'}
                </span>
                <span>SYS_INIT</span>
              </div>
            </div>
          </div>
        </div>
      )}

            <div>

                <header ref={navbarRef} className="fixed top-5 left-0 right-0 z-40 px-4 flex justify-center opacity-0">
          <nav className="w-full max-w-4xl rounded-full backdrop-blur-md bg-black/80 border border-[#FFD700]/30 px-6 py-3 flex items-center justify-between shadow-2xl shadow-yellow-950/30">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 rounded-full bg-[#FFD700] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-[#FFD700]" />
                </div>
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                CP<span className="text-[#FFD700]">_PROFILES</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#FFD700]/70">
              <a href="#hero" onClick={() => setActiveTab('home')} className={`hover:text-[#FFD700] transition-colors ${activeTab === 'home' ? 'text-[#FFD700] font-extrabold' : ''}`}>Home</a>
              <a href="#ecosystem" onClick={() => setActiveTab('ecosystem')} className={`hover:text-[#FFD700] transition-colors ${activeTab === 'ecosystem' ? 'text-[#FFD700] font-extrabold' : ''}`}>Ecosystem</a>
              <a href="#impact" onClick={() => setActiveTab('impact')} className={`hover:text-[#FFD700] transition-colors ${activeTab === 'impact' ? 'text-[#FFD700] font-extrabold' : ''}`}>Impact</a>
              <a href="#progress" onClick={() => setActiveTab('progress')} className={`hover:text-[#FFD700] transition-colors ${activeTab === 'progress' ? 'text-[#FFD700] font-extrabold' : ''}`}>Progress</a>
              <a href="#contact" onClick={() => setActiveTab('contact')} className={`hover:text-[#FFD700] transition-colors ${activeTab === 'contact' ? 'text-[#FFD700] font-extrabold' : ''}`}>Contact</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGoToAuth}
                className="text-xs font-bold uppercase tracking-wider text-[#FFD700]/80 hover:text-[#FFD700] px-3 py-1.5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGoToAuth}
                className="px-4 py-2 rounded-full bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started
              </button>
            </div>
          </nav>
        </header>

                <section id="hero" className="relative min-h-screen pt-32 pb-20 px-6 flex flex-col justify-center items-center">
          <div className="absolute inset-0 z-0 opacity-90 pointer-events-auto">
            <InteractivePhysicsCanvas />
          </div>

          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FFD700]/10 blur-[140px] rounded-full pointer-events-none z-0" />

          <div ref={heroTextRef} className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/90 border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold tracking-widest uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Unified Competitive Programming Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Dominate Every Contest. <br />
              <span className="text-[#FFD700]">
                Elevate Your Ratings.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#FFD700]/80 max-w-2xl mx-auto font-medium leading-relaxed">
              The high-octane analytics hub for competitive programmers. Consolidate your profiles, leverage AI diagnostics, and showcase verified 3D progress.
            </p>

                        <div ref={iconsContainerRef} className="flex items-center justify-center gap-4 py-2 pointer-events-auto">
              {[
                {
                  label: 'Codeforces',
                  svg: (
                    <svg className="w-5 h-5 fill-[#FFD700]" viewBox="0 0 24 24">
                      <path d="M4.5 7.5A1.5 1.5 0 0 0 3 9v9a1.5 1.5 0 0 0 3 0V9a1.5 1.5 0 0 0-1.5-1.5zM10.5 3A1.5 1.5 0 0 0 9 4.5v13.5a1.5 1.5 0 0 0 3 0V4.5A1.5 1.5 0 0 0 10.5 3zM16.5 12a1.5 1.5 0 0 0-1.5 1.5v4.5a1.5 1.5 0 0 0 3 0v-4.5A1.5 1.5 0 0 0 16.5 12z"/>
                    </svg>
                  )
                },
                {
                  label: 'LeetCode',
                  svg: (
                    <svg className="w-5 h-5 fill-[#FFD700]" viewBox="0 0 24 24">
                      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.17 5.79a1.374 1.374 0 0 0-.079 1.851l.079.083.048.046 5.304 5.304a1.374 1.374 0 0 0 1.943 0l5.304-5.304a1.374 1.374 0 0 0 0-1.943L14.444.438A1.374 1.374 0 0 0 13.483 0zm-8.87 9.172a1.374 1.374 0 0 0-.97.404L.404 12.816a1.374 1.374 0 0 0 0 1.943l3.24 3.24a1.374 1.374 0 0 0 1.943 0l3.24-3.24a1.374 1.374 0 0 0 0-1.943L5.584 9.576a1.374 1.374 0 0 0-.971-.404zm14.774 0a1.374 1.374 0 0 0-.97.404l-3.24 3.24a1.374 1.374 0 0 0 0 1.943l3.24 3.24a1.374 1.374 0 0 0 1.943 0l3.24-3.24a1.374 1.374 0 0 0 0-1.943l-3.24-3.24a1.374 1.374 0 0 0-.973-.404z"/>
                    </svg>
                  )
                },
                {
                  label: 'CodeChef',
                  svg: (
                    <svg className="w-5 h-5 fill-[#FFD700]" viewBox="0 0 24 24">
                      <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8zm-2.5-12a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 9.5 8zm5 0a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 14.5 8zm-5 7a3.5 3.5 0 0 0 5 0h-5z"/>
                    </svg>
                  )
                },
                {
                  label: 'AtCoder',
                  svg: (
                    <svg className="w-5 h-5 fill-[#FFD700]" viewBox="0 0 24 24">
                      <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13H4.5L12 6.5z"/>
                    </svg>
                  )
                },
                {
                  label: 'GitHub',
                  svg: (
                    <svg className="w-5 h-5 fill-[#FFD700]" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  )
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="main-hero-icon opacity-0 p-3 rounded-2xl bg-black border border-[#FFD700]/40 text-[#FFD700] flex items-center gap-2 shadow-lg shadow-yellow-500/10 hover:scale-110 transition-transform cursor-pointer"
                >
                  {item.svg}
                  <span className="text-xs font-bold text-white hidden sm:inline">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 pointer-events-auto">
              <button
                onClick={onGoToAuth}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FFD700] text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Launch Your Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#ecosystem"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-black/80 hover:bg-black text-[#FFD700] font-bold text-sm border border-[#FFD700]/40 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                Explore Ecosystem
              </a>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-[#FFD700]/50 z-10 animate-bounce pointer-events-none">
            Floating Physics Active | Drag badges or scroll down
          </div>
        </section>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-24 py-16">

                    <section id="ecosystem" className="anim-section sticky top-24 rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-12 shadow-2xl shadow-yellow-950/30 min-h-[620px] flex flex-col justify-between">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#FFD700]/20 pb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Global Ecosystem</span>
                <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">Interactive Problem & Solution Globe</h2>
              </div>
              <p className="text-xs text-[#FFD700]/70 max-w-sm">
                Click the glowing hotspot markers on the wireframe sphere to inspect key competitive programming challenges and our solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6">
              <div className="lg:col-span-7 h-[340px] sm:h-[400px] w-full rounded-2xl bg-black border border-[#FFD700]/20 relative overflow-hidden">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.8} />
                  <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
                  <RotatingWireframeGlobe onSelectMarker={(m) => setSelectedGlobeMarker(m)} />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#FFD700]/70 bg-black px-3 py-1 rounded-full border border-[#FFD700]/30">
                  Drag to rotate globe | Click markers to view
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FFD700]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700]/70">Target Focus</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">{selectedGlobeMarker.title}</h3>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-[#FFD700]/30 text-[#FFD700] text-xs">
                      <strong className="block text-[#FFD700] font-bold uppercase mb-1">Real-World Problem:</strong>
                      {selectedGlobeMarker.problem}
                    </div>
                    <div className="p-3.5 rounded-xl bg-yellow-400/10 border border-[#FFD700]/40 text-white text-xs">
                      <strong className="block text-[#FFD700] font-bold uppercase mb-1">Our Solution:</strong>
                      {selectedGlobeMarker.solution}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

                    <section id="impact" className="anim-section sticky top-28 rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-12 shadow-2xl shadow-yellow-950/30 min-h-[600px] flex flex-col justify-between">
            <div className="border-b border-[#FFD700]/20 pb-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Platform Impact</span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">High-Octane Competitive Features</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
              {[
                {
                  title: 'Cross-Platform Sync',
                  desc: 'Real-time rating & submission metrics aggregated from 5 major competitive programming sites.',
                  tag: 'API Live'
                },
                {
                  title: 'AI Diagnostics',
                  desc: 'Deep vector analysis pinpointing weak topics like Dynamic Programming, Graphs, and Segment Trees.',
                  tag: 'AI Coach'
                },
                {
                  title: 'Anti-Spoof Rankings',
                  desc: 'Cryptographically verified leaderboard metrics to ensure 100% legitimate handle tracking.',
                  tag: 'Verified'
                },
                {
                  title: '3D Shareable Cards',
                  desc: 'Interactive tilt cards engineered for sharing verified achievements on LinkedIn & GitHub.',
                  tag: 'Social 3D'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-black border border-[#FFD700]/30 hover:border-[#FFD700] transition-all hover:-translate-y-1 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-black bg-[#FFD700]">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black border border-[#FFD700]/30 text-[#FFD700]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-[#FFD700]/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl bg-black border border-[#FFD700]/30 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#FFD700]">{liveStats.coders}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]/70">Registered Coders</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#FFD700]">{liveStats.problems}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]/70">Indexed CP Problems</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#FFD700]">{liveStats.platforms}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FFD700]/70">Connected Platforms</div>
              </div>
            </div>
          </section>

                    <section id="progress" className="anim-section sticky top-32 rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-12 shadow-2xl shadow-yellow-950/30 min-h-[620px] flex flex-col justify-between">
            <div className="border-b border-[#FFD700]/20 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Custom Showcase</span>
                <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">Interactive 3D Progress Sharing Card</h2>
              </div>
              <p className="text-xs text-[#FFD700]/70 max-w-xs">
                Customize your verified metrics below, preview the card, and export or copy your achievement link.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6">
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-sm font-bold text-[#FFD700] uppercase tracking-wider">Customize Stats</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#FFD700]/70 mb-1">Codeforces Rating</label>
                    <input
                      type="text"
                      value={cardStats.cfRating}
                      onChange={(e) => setCardStats({ ...cardStats, cfRating: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#FFD700]/70 mb-1">LeetCode Solved</label>
                    <input
                      type="text"
                      value={cardStats.lcSolved}
                      onChange={(e) => setCardStats({ ...cardStats, lcSolved: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#FFD700]/70 mb-1">CodeChef Tier</label>
                    <input
                      type="text"
                      value={cardStats.ccStars}
                      onChange={(e) => setCardStats({ ...cardStats, ccStars: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleDownloadCard}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#FFD700] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export PNG Card
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-3 rounded-xl bg-black text-[#FFD700] font-bold text-xs flex items-center gap-2 border border-[#FFD700]/40 transition-colors"
                  >
                    {copiedCard ? <Check className="w-4 h-4 text-[#FFD700]" /> : <Copy className="w-4 h-4" />}
                    {copiedCard ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 flex justify-center">
                <div
                  ref={cardRef}
                  className="w-full max-w-md p-6 rounded-3xl bg-black border-2 border-[#FFD700] shadow-2xl shadow-yellow-500/20 space-y-6 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-[#FFD700]/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFD700] p-0.5">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-black text-xs text-[#FFD700]">
                          CP
                        </div>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">Verified Competitive Coder</h4>
                        <p className="text-[10px] text-[#FFD700]/70">CP_PROFILES Identity Badge</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[10px] font-extrabold uppercase">
                      Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-black border border-[#FFD700]/30">
                      <span className="block text-[10px] text-[#FFD700]/70 font-bold uppercase">Codeforces</span>
                      <span className="text-base font-black text-[#FFD700]">{cardStats.cfRating}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black border border-[#FFD700]/30">
                      <span className="block text-[10px] text-[#FFD700]/70 font-bold uppercase">LeetCode</span>
                      <span className="text-base font-black text-[#FFD700]">{cardStats.lcSolved}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black border border-[#FFD700]/30">
                      <span className="block text-[10px] text-[#FFD700]/70 font-bold uppercase">CodeChef</span>
                      <span className="text-base font-black text-[#FFD700]">{cardStats.ccStars}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black border border-[#FFD700]/30 flex items-center justify-between text-xs">
                    <span className="text-[#FFD700]/70 font-bold">Global Platform Standing</span>
                    <span className="font-black text-[#FFD700]">{cardStats.globalRank}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#FFD700]/50 pt-2 border-t border-[#FFD700]/10">
                    <span>Powered by AI Engine</span>
                    <span>cpprofiles.app</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

                    <footer id="contact" className="anim-section rounded-3xl bg-black border border-[#FFD700]/40 p-6 sm:p-12 shadow-2xl space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#FFD700]/20 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FFD700] p-0.5 shadow-lg shadow-yellow-500/20">
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center font-black text-xl text-[#FFD700]">
                    DS
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Made by Deepanshu Solanki</h3>
                    <span className="px-2 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700] text-[10px] font-bold uppercase">
                      Creator & Developer
                    </span>
                  </div>
                  <p className="text-xs text-[#FFD700]/70 mt-0.5">
                    Engineered for competitive programmers globally. Contact: +91 9871409724
                  </p>
                </div>
              </div>

                            <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="https://github.com/DeepanshuSolanki09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-black hover:bg-[#FFD700] text-[#FFD700] hover:text-black border border-[#FFD700]/40 transition-all hover:scale-105 flex items-center gap-2 text-xs font-bold group"
                  title="GitHub Profile"
                >
                  <svg className="w-4 h-4 fill-[#FFD700] group-hover:fill-black transition-colors" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/deepanshu-solanki-081346318/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-black hover:bg-[#FFD700] text-[#FFD700] hover:text-black border border-[#FFD700]/40 transition-all hover:scale-105 flex items-center gap-2 text-xs font-bold group"
                  title="LinkedIn Profile"
                >
                  <svg className="w-4 h-4 fill-[#FFD700] group-hover:fill-black transition-colors" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>

                <a
                  href="mailto:solankideepanshu2006@gmail.com"
                  className="p-3 rounded-xl bg-black hover:bg-[#FFD700] text-[#FFD700] hover:text-black border border-[#FFD700]/40 transition-all hover:scale-105 flex items-center gap-2 text-xs font-bold group"
                  title="Email Deepanshu"
                >
                  <Mail className="w-4 h-4 text-[#FFD700] group-hover:text-black transition-colors" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFD700]/60 gap-4">
              <div className="flex items-center gap-2 font-mono">
                <Code2 className="w-4 h-4 text-[#FFD700]" />
                <span className="font-bold text-[#FFD700]">CP_PROFILES</span>
                <span>— Developed by Deepanshu Solanki</span>
              </div>
              <p>© {new Date().getFullYear()} Deepanshu Solanki. All rights reserved.</p>
            </div>
          </footer>

        </div>

      </div>

    </div>
  );
}
