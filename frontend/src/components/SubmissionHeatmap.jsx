'use client';

import React, { useMemo } from 'react';
import { Calendar, Flame } from 'lucide-react';

export default function SubmissionHeatmap({ submissions = [], submissionCalendar = null, colorTheme = 'purple', title = 'Submission Activity' }) {
  const { gridDays, totalActiveDays, maxDailyCount, totalSubmissions, currentStreak } = useMemo(() => {
    const countsByDate = {};
    let totalCount = 0;

    if (submissionCalendar) {
      try {
        const calDict = typeof submissionCalendar === 'string' ? JSON.parse(submissionCalendar) : submissionCalendar;
        if (typeof calDict === 'object' && calDict !== null) {
          Object.entries(calDict).forEach(([ts, count]) => {
            let numTs = Number(ts);
            if (numTs < 10000000000) numTs *= 1000;
            const dateStr = new Date(numTs).toISOString().split('T')[0];
            const numCount = Number(count) || 0;
            countsByDate[dateStr] = (countsByDate[dateStr] || 0) + numCount;
            totalCount += numCount;
          });
        }
      } catch (err) {
        console.error('Error parsing submissionCalendar in heatmap:', err);
      }
    }

    submissions.forEach((sub) => {
      let ts = sub.timestamp || sub.creationTimeSeconds || sub.creationTime;
      if (!ts) return;
      if (typeof ts === 'number' && ts < 10000000000) {
        ts *= 1000;
      } else if (typeof ts === 'string' && !isNaN(Number(ts))) {
        const numTs = Number(ts);
        ts = numTs < 10000000000 ? numTs * 1000 : numTs;
      }

      const dateStr = new Date(ts).toISOString().split('T')[0];
      if (!submissionCalendar || !countsByDate[dateStr]) {
        countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
        if (!submissionCalendar) totalCount++;
      }
    });

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let maxCount = 0;
    let activeDays = 0;

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = countsByDate[dateStr] || 0;
      
      if (count > 0) {
        activeDays++;
        if (count > maxCount) maxCount = count;
      }

      days.push({
        date: dateStr,
        count,
        dayOfWeek: d.getDay()
      });
    }

    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        streak++;
      } else if (i === days.length - 1) {
        continue;
      } else {
        break;
      }
    }

    return {
      gridDays: days,
      totalActiveDays: activeDays,
      maxDailyCount: maxCount,
      totalSubmissions: totalCount,
      currentStreak: streak
    };
  }, [submissions]);

  const getColorClass = (count) => {
    if (count === 0) return 'bg-[#0A0E14] border-[#1F2733]';

    const ratio = maxDailyCount > 0 ? count / maxDailyCount : 0;

    if (colorTheme === 'green') {
      if (ratio < 0.25) return 'bg-[#00FF9C]/20 border-[#00FF9C]/40 text-[#00FF9C] shadow-[0_0_8px_rgba(0,255,156,0.2)]';
      if (ratio < 0.6) return 'bg-[#00FF9C]/50 border-[#00FF9C]/70 text-black shadow-[0_0_12px_rgba(0,255,156,0.4)]';
      return 'bg-[#00FF9C] border-[#00FF9C] text-black font-bold shadow-[0_0_16px_rgba(0,255,156,0.7)]';
    }

    if (colorTheme === 'gold') {
      if (ratio < 0.25) return 'bg-[#FFD700]/20 border-[#FFD700]/40 text-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.2)]';
      if (ratio < 0.6) return 'bg-[#FFD700]/50 border-[#FFD700]/70 text-black shadow-[0_0_12px_rgba(255,215,0,0.4)]';
      return 'bg-[#FFD700] border-[#FFD700] text-black font-bold shadow-[0_0_16px_rgba(255,215,0,0.7)]';
    }

    if (ratio < 0.25) return 'bg-[#7C5CFF]/25 border-[#7C5CFF]/40 text-[#7C5CFF] shadow-[0_0_8px_rgba(124,92,255,0.2)]';
    if (ratio < 0.6) return 'bg-[#7C5CFF]/60 border-[#7C5CFF]/80 text-white shadow-[0_0_12px_rgba(124,92,255,0.4)]';
    return 'bg-[#7C5CFF] border-[#7C5CFF] text-white font-bold shadow-[0_0_16px_rgba(124,92,255,0.7)]';
  };

  const weeks = useMemo(() => {
    const w = [];
    let currentWeek = [];

    gridDays.forEach((day, idx) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || idx === gridDays.length - 1) {
        w.push(currentWeek);
        currentWeek = [];
      }
    });

    return w;
  }, [gridDays]);

  const monthLabels = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let lastMonth = -1;

    gridDays.forEach((d, idx) => {
      const dateObj = new Date(d.date);
      const m = dateObj.getMonth();
      if (m !== lastMonth && d.dayOfWeek === 0) {
        labels.push({ label: months[m], colIndex: Math.floor(idx / 7) });
        lastMonth = m;
      }
    });

    return labels;
  }, [gridDays]);

  const accentColor = colorTheme === 'green' ? '#00FF9C' : colorTheme === 'gold' ? '#FFD700' : '#7C5CFF';

  return (
    <div className="cyber-panel p-6 bg-[#10151F] border border-[#1F2733] rounded-xl space-y-4 font-mono text-[#E6EDF3]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2733]">
        <h4 className="font-bold text-lg flex items-center gap-2" style={{ color: '#E6EDF3' }}>
          <Calendar className="w-5 h-5" style={{ color: accentColor }} />
          {title}
        </h4>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-[#0A0E14] px-3 py-1.5 rounded-lg border border-[#1F2733]">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-[#7C8797]">Streak:</span>
            <span className="font-bold text-orange-400">{currentStreak} days</span>
          </div>
          <div className="bg-[#0A0E14] px-3 py-1.5 rounded-lg border border-[#1F2733]">
            <span className="text-[#7C8797]">Active Days:</span>{' '}
            <span className="font-bold" style={{ color: accentColor }}>{totalActiveDays}</span>
          </div>
          <div className="bg-[#0A0E14] px-3 py-1.5 rounded-lg border border-[#1F2733]">
            <span className="text-[#7C8797]">Total:</span>{' '}
            <span className="font-bold text-white">{totalSubmissions}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px] space-y-2">
          <div className="flex text-[10px] text-[#7C8797] pl-8 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute font-semibold"
                style={{ left: `${m.colIndex * 14 + 32}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            <div className="flex flex-col justify-between text-[9px] text-[#7C8797] font-semibold pr-2 py-0.5 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div className="flex gap-[3px] flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count} submission${day.count === 1 ? '' : 's'}`}
                      className={`w-[11px] h-[11px] rounded-[2px] border transition-all duration-150 hover:scale-125 cursor-pointer ${getColorClass(
                        day.count
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#7C8797] pt-2 border-t border-[#1F2733]/60">
        <span>Yearly Activity Overview</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0A0E14] border border-[#1F2733]" />
          <div className={`w-2.5 h-2.5 rounded-[2px] ${getColorClass(1)}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] ${getColorClass(Math.ceil(maxDailyCount * 0.5) || 3)}`} />
          <div className={`w-2.5 h-2.5 rounded-[2px] ${getColorClass(maxDailyCount || 5)}`} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
