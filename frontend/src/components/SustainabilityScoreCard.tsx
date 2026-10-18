import React from 'react';
import { SustainabilityScoreResponse } from '../types';
import { Flame, Trophy, Award, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  sustainability: SustainabilityScoreResponse;
}

export const SustainabilityScoreCard: React.FC<Props> = ({ sustainability }) => {
  const { score, tier, next_tier, points_to_next_tier, streak_days, badges } = sustainability;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-eco-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Score Gauge */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG circular progress */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-700/50 fill-none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                strokeLinecap="round"
                className="text-eco-400 fill-none transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black tracking-tight">{score}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Points</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-eco-500/20 text-eco-300 border border-eco-500/30">
                {tier}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                {streak_days} Day Streak
              </span>
            </div>
            <h3 className="text-xl font-extrabold mt-1 text-white tracking-tight">
              Personal Sustainability Level
            </h3>
            {points_to_next_tier > 0 ? (
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Earn <span className="text-eco-400 font-bold">{points_to_next_tier} more points</span> to achieve <span className="text-white font-bold">{next_tier}</span> status!
              </p>
            ) : (
              <p className="text-xs text-eco-300 mt-1 font-bold">
                Maximum sustainability tier achieved! You are a community leader.
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Stats pills */}
        <div className="grid grid-cols-2 gap-3 border-t sm:border-t-0 sm:border-l border-slate-700/60 pt-4 sm:pt-0 sm:pl-6 shrink-0">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400">Recycled Items</p>
            <p className="text-base font-black text-white mt-0.5">{sustainability.recycled_count} / {sustainability.total_scans}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-400">Recycling Rate</p>
            <p className="text-base font-black text-eco-400 mt-0.5">{sustainability.recycling_rate}%</p>
          </div>
        </div>
      </div>

      {/* Badges Row */}
      {badges && badges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Eco Achievements & Badges
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  b.unlocked
                    ? 'bg-white/10 border-eco-500/40 text-white'
                    : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                }`}
                title={b.description}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-xs font-extrabold truncate">{b.name}</div>
                <div className="text-[9px] mt-0.5 font-semibold">
                  {b.unlocked ? (
                    <span className="text-eco-400">Unlocked</span>
                  ) : (
                    <span className="text-slate-400">{Math.round(b.progress * 100)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
