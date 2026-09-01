'use client';

import React from 'react';
import { Brain, AlertCircle, Lightbulb, Compass, Award, Activity, CheckCircle2 } from 'lucide-react';

export default function AiReportViewer({ reportData }) {
  if (!reportData) return null;

  const analysis = reportData.analysis || reportData;

  const strongTopics = analysis.strong_topics || [];
  const weakTopics = analysis.weak_topics || [];
  const reasons = analysis.reasons || [];
  const howToImprove = analysis.how_to_improve || [];
  const platformRecommendation = analysis.platform_recommendation || '';
  const ratingRoadmap = analysis.rating_roadmap || [];
  const contestInsight = analysis.contest_insight || '';
  const consistencyScore = analysis.consistency_score || 'N/A';

  return (
    <div className="space-y-6 font-fredoka text-gray-800">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 border-2 border-gray-900 rounded-xl">
            <Activity className="w-6 h-6 text-purple-900" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 block">Consistency Score</span>
            <span className="font-lilita text-2xl text-purple-900">{consistencyScore}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm flex items-center gap-4 sm:col-span-2">
          <div className="p-3 bg-amber-100 border-2 border-gray-900 rounded-xl shrink-0">
            <Compass className="w-6 h-6 text-amber-900" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 block">Platform Recommendation</span>
            <span className="font-bold text-sm text-gray-800 line-clamp-2">
              {platformRecommendation || 'Pending Data Input'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-lilita text-lg text-emerald-950">Strong Topics</h4>
          </div>
          {strongTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strongTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-emerald-400 text-emerald-900 font-bold rounded-lg text-xs">
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-800 italic bg-white/60 p-3 rounded-xl border border-emerald-200">
              No strong topics recorded yet. Connect handles or solve problems to track mastery.
            </p>
          )}
        </div>

        <div className="bg-rose-50 p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h4 className="font-lilita text-lg text-rose-950">Weak Topics</h4>
          </div>
          {weakTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((topic, i) => (
                <span key={i} className="px-3 py-1 bg-white border border-rose-400 text-rose-900 font-bold rounded-lg text-xs">
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-rose-800 italic bg-white/60 p-3 rounded-xl border border-rose-200">
              No weak topics flagged yet. Submit contest solutions to analyze error points.
            </p>
          )}
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-amber-700">
            <AlertCircle className="w-5 h-5" />
            <h4 className="font-lilita text-lg text-gray-900">Analysis Observations</h4>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-lilita text-amber-600 text-base">#</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {howToImprove.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sky-700">
            <Lightbulb className="w-5 h-5" />
            <h4 className="font-lilita text-lg text-gray-900">How to Improve & Action Plan</h4>
          </div>
          <ul className="space-y-2.5 text-sm">
            {howToImprove.map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-sky-50 rounded-xl border border-sky-200">
                <span className="w-6 h-6 bg-sky-300 text-sky-950 font-lilita rounded-full flex items-center justify-center text-xs shrink-0 border border-gray-900">
                  {i + 1}
                </span>
                <span className="text-gray-800 pt-0.5">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-purple-700">
            <Award className="w-5 h-5" />
            <h4 className="font-lilita text-lg text-gray-900">Contest Insight</h4>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 bg-purple-50 p-3.5 rounded-xl border border-purple-200 leading-relaxed">
            {contestInsight || 'No contest insights available yet.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-gray-900 soft-comic-shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-indigo-700">
            <Compass className="w-5 h-5" />
            <h4 className="font-lilita text-lg text-gray-900">Rating Roadmap</h4>
          </div>
          {ratingRoadmap.length > 0 ? (
            <div className="space-y-2">
              {ratingRoadmap.map((step, idx) => (
                <div key={idx} className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <span className="font-lilita text-indigo-600">Step {idx + 1}:</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-700 bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 leading-relaxed">
              No rating roadmap targets established yet. Add target contest ratings to build your roadmap!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
