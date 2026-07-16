/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  ExternalLink, 
  Play, 
  Sparkles, 
  AlertTriangle,
  Code2,
  ListTodo
} from 'lucide-react';
import { SkillValidation } from '../types';

interface ValidationPanelProps {
  validation: SkillValidation[];
  onValidate: () => Promise<void>;
  hasProfile: boolean;
}

export default function ValidationPanel({ validation, onValidate, hasProfile }: ValidationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const handleRunValidation = async () => {
    setIsLoading(true);
    try {
      await onValidate();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: 'Verified' | 'Unverified' | 'Partial') => {
    switch (status) {
      case 'Verified':
        return <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Verified</span>;
      case 'Partial':
        return <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Partial Trace</span>;
      case 'Unverified':
        return <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Unverified Gap</span>;
    }
  };

  return (
    <div className="space-y-6" id="validation-panel">
      
      {/* Platform Audit Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-sans text-base font-semibold text-gray-900 mb-1">
          Skill-to-Code Validation Audit
        </h3>
        <p className="text-xs text-gray-500 font-sans mb-4">
          Compares technologies declared in your resume against compiled proof of code in your connected GitHub repositories.
        </p>

        {hasProfile ? (
          <button
            onClick={handleRunValidation}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isLoading ? 'Auditing Code Repositories...' : 'Run Skill Validation Audit'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 font-sans max-w-md">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Please integrate your GitHub Profile and upload a Resume first to activate this audit.</span>
          </div>
        )}
      </div>

      {validation.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Block: Audit List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-3">
                Extracted Technologies Cross-Reference
              </h4>

              <div className="divide-y divide-gray-100 font-sans text-xs">
                {validation.map((v) => (
                  <div key={v.skill} className="py-3.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-800 text-sm">{v.skill}</span>
                        <div className="text-gray-400 text-[10px] mt-1 flex flex-wrap gap-1.5 items-center">
                          <span className="font-semibold text-gray-500 uppercase tracking-wide">{v.level}</span>
                          <span>•</span>
                          {v.githubEvidence && (
                            <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono text-[9px] font-medium">
                              GitHub Codebase: {v.matchingRepos.length > 0 ? v.matchingRepos.join(', ') : 'Verified Repo'}
                            </span>
                          )}
                          {v.leetcodeEvidence && (
                            <span className="text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-mono text-[9px] font-medium">
                              LeetCode Practice: {v.leetcodeSolvedCount || 0}+ solved problems
                            </span>
                          )}
                          {!v.githubEvidence && !v.leetcodeEvidence && (
                            <span className="text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-mono text-[9px] font-medium">
                              No active repository or contest activity trace
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(v.status)}
                        {v.remedialProject && (
                          <button
                            onClick={() => setExpandedSkill(expandedSkill === v.skill ? null : v.skill)}
                            className="text-xs text-indigo-600 font-semibold hover:underline bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded transition"
                          >
                            {expandedSkill === v.skill ? 'Hide Remedial' : 'Bridge Gap'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Remedial Project Expand Block */}
                    {expandedSkill === v.skill && v.remedialProject && (
                      <div className="mt-3.5 p-4 border border-indigo-100 bg-indigo-50/30 rounded-lg">
                        <h5 className="font-semibold text-indigo-900 flex items-center gap-1.5 mb-1 text-xs">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Remedial Project: {v.remedialProject.title}</span>
                        </h5>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {v.remedialProject.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {v.remedialProject.recommendedStack.map((tech) => (
                            <span key={tech} className="bg-white border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Block: Explanatory Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-indigo-500" />
                <span>Why Validation Matters?</span>
              </h4>
              <p className="text-xs text-gray-500 font-sans leading-relaxed mb-3">
                Modern recruiters cross-verify keywords listed on placements resumes. Gaps between resume claims and public GitHub repositories raise transparency concerns in engineering placements.
              </p>
              
              <div className="space-y-3 pt-3 border-t border-gray-150 text-xs font-sans">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-gray-600"><strong>Verified</strong> skills are supported by clear language indices and repo config records.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-gray-600"><strong>Partial</strong> skills have weak, tangential keywords but lack clear repository demonstration.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-gray-600"><strong>Unverified</strong> skills have zero active files or commits demonstrating usage on your connected GitHub profile.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
