/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  Search, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Sliders, 
  CheckCircle,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { LeetCodeProfile } from '../types';

interface LeetCodePanelProps {
  profile: LeetCodeProfile | null;
  aiFeedback: {
    assessment: string;
    recommendedTopics: string[];
    timeComplexityStrengths: string;
  } | null;
  onAnalyze: (username: string, customStats?: any) => Promise<void>;
}

export default function LeetCodePanel({ profile, aiFeedback, onAnalyze }: LeetCodePanelProps) {
  const [usernameInput, setUsernameInput] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom manual counters for full user flexibility
  const [easyCount, setEasyCount] = useState(profile?.easySolved || 60);
  const [mediumCount, setMediumCount] = useState(profile?.mediumSolved || 100);
  const [hardCount, setHardCount] = useState(profile?.hardSolved || 15);
  const [showConfig, setShowConfig] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const customStats = {
        totalSolved: Number(easyCount) + Number(mediumCount) + Number(hardCount),
        easySolved: Number(easyCount),
        mediumSolved: Number(mediumCount),
        hardSolved: Number(hardCount)
      };
      await onAnalyze(usernameInput.trim(), customStats);
    } catch (err: any) {
      setError(err.message || 'LeetCode integration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="leetcode-panel">
      
      {/* Search & Config Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-sans text-base font-semibold text-gray-900 mb-1">
              LeetCode DSA Profiler
            </h3>
            <p className="text-xs text-gray-500 font-sans">
              Connect your competitive coding account. Modify stats manually if unofficial LeetCode API routes are delayed.
            </p>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 py-1 px-2.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Hide Customizer' : 'Customize Stats'}</span>
          </button>
        </div>

        {showConfig && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Easy Solved</label>
              <input
                type="number"
                value={easyCount}
                onChange={(e) => setEasyCount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Medium Solved</label>
              <input
                type="number"
                value={mediumCount}
                onChange={(e) => setMediumCount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Hard Solved</label>
              <input
                type="number"
                value={hardCount}
                onChange={(e) => setHardCount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="Enter LeetCode Username (e.g., lc_coder_2026)"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Scanning...' : 'Integrate Profiles'}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-sans">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Block: Stats Visual Cards */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Leetcode Summary Panel */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-7 h-7" />
              </div>
              <h4 className="font-sans font-semibold text-gray-900">@{profile.username}</h4>
              <p className="text-[11px] text-gray-400 font-sans uppercase tracking-wider font-semibold mt-1">
                DSA PREPAREDNESS SCORE
              </p>
              
              <div className="my-4">
                <span className="text-4xl font-bold tracking-tight text-gray-900 font-sans">
                  {profile.overallLeetCodeScore}%
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-2 gap-2 text-xs font-sans text-left">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-400 font-medium">Global Rank</div>
                  <div className="text-sm font-bold text-gray-800 mt-0.5">#{profile.ranking.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-400 font-medium">Acceptance</div>
                  <div className="text-sm font-bold text-gray-800 mt-0.5">{profile.acceptanceRate}%</div>
                </div>
              </div>
            </div>

            {/* Submissions breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Problem Category Distribution</span>
              </h4>

              <div className="space-y-4 font-sans text-xs">
                <div>
                  <div className="flex justify-between font-medium text-gray-600 mb-1">
                    <span>Easy Problems</span>
                    <span className="font-semibold text-gray-800">{profile.easySolved} Solved</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, profile.easySolved / 80 * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Recommended Target: 80+</div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-gray-600 mb-1">
                    <span>Medium Problems</span>
                    <span className="font-semibold text-gray-800">{profile.mediumSolved} Solved</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, profile.mediumSolved / 150 * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Recommended Target: 150+ (Hiring Standard)</div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-gray-600 mb-1">
                    <span>Hard Problems</span>
                    <span className="font-semibold text-gray-800">{profile.hardSolved} Solved</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, profile.hardSolved / 30 * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Recommended Target: 30+</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Block: AI competitive programming insights & submissions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Advisor Panel */}
            {aiFeedback && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-4 top-4 opacity-10">
                  <Sparkles className="w-20 h-20 text-amber-500" />
                </div>
                
                <h4 className="font-sans font-semibold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Algorithms Coach & Feedback</span>
                </h4>
                
                <p className="text-xs text-amber-950 font-sans mt-2 leading-relaxed">
                  {aiFeedback.assessment}
                </p>

                <div className="mt-4 pt-4 border-t border-amber-200/60 text-xs font-sans">
                  <h5 className="font-semibold text-amber-900 uppercase tracking-wide text-[10px] mb-2.5">
                    Critical Target Topics for Placement Rounds
                  </h5>
                  <div className="space-y-2">
                    {aiFeedback.recommendedTopics.map((topic, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-amber-950 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-amber-200 rounded-lg text-xs font-sans">
                  <h5 className="font-semibold text-amber-900 mb-1">Computational Models Assessment</h5>
                  <p className="text-gray-600 leading-relaxed">{aiFeedback.timeComplexityStrengths}</p>
                </div>
              </div>
            )}

            {/* Submission timeline simulation */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-base font-semibold text-gray-900 mb-3">
                Recent Problem Status
              </h4>

              <div className="divide-y divide-gray-100 font-sans text-xs">
                {profile.recentSubmissions.map((sub, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-semibold text-gray-800">{sub.title}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">{sub.language} • {sub.time}</div>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sub.status === 'Accepted' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm relative overflow-hidden group">
          
          {/* Decorative faint blueprint grid reference coords */}
          <div className="absolute top-4 left-4 text-[9px] font-mono text-slate-400 select-none">
            REF: DSA_COMPLEXITY_MODEL_1
          </div>
          <div className="absolute bottom-4 right-4 text-[9px] font-mono text-slate-400 select-none">
            SYS_STATE: UNINITIALIZED_COACH
          </div>
          
          {/* Stacked wireframe graphics with dot matrix background */}
          <div className="relative w-48 h-28 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 dot-matrix opacity-40 rounded-xl" />
            
            {/* Background stacked card with rotation */}
            <div className="absolute w-32 h-20 border border-slate-200 bg-slate-50/50 rounded-lg transform rotate-6 translate-y-1 -translate-x-3 flex items-center justify-between p-3 opacity-60">
              <div className="w-8 h-8 rounded-full border border-slate-300 border-dashed" />
              <div className="space-y-1 w-16">
                <div className="h-1 bg-slate-200 rounded w-full" />
                <div className="h-1 bg-slate-200 rounded w-2/3" />
              </div>
            </div>

            {/* Front focused interactive card */}
            <div className="absolute w-36 h-20 border border-[#F97316]/30 bg-white/95 rounded-lg shadow-sm transform -rotate-3 flex items-center justify-start p-3 transition-transform group-hover:scale-105 duration-300">
              {/* Dynamic amber blink indicator badge */}
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316]/30 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F97316]"></span>
              </span>
              <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-[#F97316] font-mono text-xs font-bold">
                f(n)
              </div>
              <div className="ml-3 space-y-1.5 w-full">
                <div className="h-1.5 w-2/3 bg-slate-300 rounded" />
                <div className="h-1 w-5/6 bg-slate-200 rounded" />
              </div>
            </div>
          </div>

          <h4 className="font-sans font-extrabold text-slate-800 text-xl tracking-tight">
            Algorithmic Statistics <span className="bg-gradient-to-r from-[#F97316] to-[#EA580C] bg-clip-text text-transparent">Unlinked</span>
          </h4>
          <p className="text-xs text-slate-400 font-sans mt-2 max-w-sm mx-auto leading-relaxed">
            Sync your public LeetCode handle to compile data structures coverage ratings, time complexity milestones, and target topic recommendations.
          </p>

          {/* Corner Micrometrics & Diagnostic Badges */}
          <div className="mt-5 flex justify-center gap-2">
            <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono font-bold border border-slate-200">
              ● SOLVED: 0_TASKS
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-mono font-bold border border-amber-100">
              ● RUNTIME_GRADE: PENDING
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
