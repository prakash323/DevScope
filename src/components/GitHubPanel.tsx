/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  FileCode, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  Layers
} from 'lucide-react';
import { GitHubProfile } from '../types';

interface GitHubPanelProps {
  profile: GitHubProfile | null;
  aiFeedback: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    actionPlan: string[];
  } | null;
  onAnalyze: (username: string) => Promise<void>;
}

export default function GitHubPanel({ profile, aiFeedback, onAnalyze }: GitHubPanelProps) {
  const [usernameInput, setUsernameInput] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    
    setIsLoading(true);
    setError('');
    try {
      await onAnalyze(usernameInput.trim());
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check network and API settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRepo = (name: string) => {
    setExpandedRepo(expandedRepo === name ? null : name);
  };

  return (
    <div className="space-y-6" id="github-panel">
      
      {/* Search Header Row */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-sans text-base font-semibold text-gray-900 mb-1">
          GitHub Profile Integrator
        </h3>
        <p className="text-xs text-gray-500 font-sans mb-4">
          Unifies commit activity, repository metrics, code structures, and documentation to score portfolio health.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="Enter GitHub Username (e.g., torvalds)"
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
            {isLoading ? 'Scanning...' : 'Integrate'}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-sans">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Profile Summary & Rules Rubric */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full mx-auto border border-gray-200"
              />
              <h4 className="font-sans font-semibold text-gray-900 mt-3">{profile.name}</h4>
              <p className="text-xs text-gray-400 font-sans">@{profile.username}</p>
              <p className="text-xs text-gray-500 font-sans mt-2 italic px-4">
                "{profile.bio || 'Developer profile connected.'}"
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 text-xs font-sans">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-semibold text-gray-800">{profile.publicRepos}</div>
                  <div className="text-gray-400">Repositories</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-semibold text-gray-800">{profile.followers}</div>
                  <div className="text-gray-400">Followers</div>
                </div>
              </div>
            </div>

            {/* Score Metrics Breakdown Panel */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Deterministic Rubric Grading</span>
              </h4>
              
              <div className="space-y-3 font-sans text-xs">
                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>README Standards (15%)</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(profile.repositories.reduce((acc, r) => acc + r.readmeScore, 0) / profile.repositories.length)} / 15
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${(profile.repositories.reduce((acc, r) => r.readmeScore + acc, 0) / profile.repositories.length) / 15 * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Commit Frequency (20%)</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(profile.repositories.reduce((acc, r) => acc + r.commitFrequencyScore, 0) / profile.repositories.length)} / 20
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${(profile.repositories.reduce((acc, r) => r.commitFrequencyScore + acc, 0) / profile.repositories.length) / 20 * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Test Coverage (10%)</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(profile.repositories.reduce((acc, r) => acc + r.testingScore, 0) / profile.repositories.length)} / 10
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${(profile.repositories.reduce((acc, r) => r.testingScore + acc, 0) / profile.repositories.length) / 10 * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span>Deployment Readiness (15%)</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(profile.repositories.reduce((acc, r) => acc + r.readmeScore, 0) / profile.repositories.length)} / 15
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${(profile.repositories.reduce((acc, r) => r.readmeScore + acc, 0) / profile.repositories.length) / 15 * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-slate-200/60 p-2.5 rounded-lg mt-4 text-[11px] text-gray-500 font-sans flex gap-1.5">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Scores are calculated by matching documentation structures and configuration indicators in repository files.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Repository Details & AI explainability */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Explainability Banner */}
            {aiFeedback && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-10">
                  <Sparkles className="w-20 h-20 text-indigo-600" />
                </div>
                
                <h4 className="font-sans font-semibold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Explainable AI Recruiter Feedback</span>
                </h4>
                <p className="text-xs text-indigo-950 font-sans mt-2 leading-relaxed">
                  {aiFeedback.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-indigo-100 text-xs font-sans">
                  <div>
                    <h5 className="font-semibold text-indigo-900 uppercase tracking-wide text-[10px] mb-2">Strengths Detected</h5>
                    <ul className="space-y-1.5 text-indigo-950">
                      {aiFeedback.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-1.5 items-start">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-indigo-900 uppercase tracking-wide text-[10px] mb-2">Identified Gaps</h5>
                    <ul className="space-y-1.5 text-indigo-950">
                      {aiFeedback.weaknesses.map((weak, idx) => (
                        <li key={idx} className="flex gap-1.5 items-start">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-indigo-100 rounded-lg text-xs font-sans">
                  <h5 className="font-semibold text-indigo-900 mb-1.5">Recruiter Improvement Checklist</h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
                    {aiFeedback.actionPlan.map((action, idx) => (
                      <li key={idx} className="leading-relaxed">{action}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Repositories Scanned */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-base font-semibold text-gray-900 mb-4">
                Analyzed Repositories
              </h4>

              <div className="space-y-3">
                {profile.repositories.map((repo) => (
                  <div 
                    key={repo.name}
                    className="border border-gray-150 rounded-lg overflow-hidden bg-white hover:border-gray-300 transition"
                  >
                    <div 
                      onClick={() => toggleRepo(repo.name)}
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50/50"
                    >
                      <div className="font-sans">
                        <div className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                          <span>{repo.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                            {repo.language}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 max-w-md truncate mt-0.5">
                          {repo.description}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <div className="font-mono font-semibold text-gray-900">{repo.overallScore}%</div>
                          <div className="text-[10px] text-gray-400">Score</div>
                        </div>
                        {expandedRepo === repo.name ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {expandedRepo === repo.name && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                        <div className="bg-white border border-gray-200/60 p-2.5 rounded-lg shadow-sm">
                          <div className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Readme Quality</div>
                          <div className="font-mono font-semibold text-gray-900 mt-1">{repo.readmeScore}/15</div>
                          <div className="w-full bg-gray-100 h-1 rounded mt-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-1" style={{ width: `${repo.readmeScore / 15 * 100}%` }} />
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200/60 p-2.5 rounded-lg shadow-sm">
                          <div className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Commit Cadence</div>
                          <div className="font-mono font-semibold text-gray-900 mt-1">{repo.commitFrequencyScore}/20</div>
                          <div className="w-full bg-gray-100 h-1 rounded mt-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-1" style={{ width: `${repo.commitFrequencyScore / 20 * 100}%` }} />
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200/60 p-2.5 rounded-lg shadow-sm">
                          <div className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Test Suite</div>
                          <div className="font-mono font-semibold text-gray-900 mt-1">{repo.testingScore}/10</div>
                          <div className="w-full bg-gray-100 h-1 rounded mt-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-1" style={{ width: `${repo.testingScore / 10 * 100}%` }} />
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200/60 p-2.5 rounded-lg shadow-sm">
                          <div className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Diversity Score</div>
                          <div className="font-mono font-semibold text-gray-900 mt-1">{repo.projectDiversityScore}/15</div>
                          <div className="w-full bg-gray-100 h-1 rounded mt-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-1" style={{ width: `${repo.projectDiversityScore / 15 * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-sans font-semibold text-gray-800 text-lg">No GitHub Profile Connected</h4>
          <p className="text-sm text-gray-400 font-sans mt-1 max-w-sm mx-auto">
            Integrate your GitHub candidate profile above to retrieve code metrics and review recruiter gaps.
          </p>
        </div>
      )}

    </div>
  );
}
