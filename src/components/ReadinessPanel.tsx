/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Info, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { RoleReadiness, CompanyReadiness, CareerRole, TargetCompany } from '../types';

interface ReadinessPanelProps {
  roles: RoleReadiness[];
  companies: CompanyReadiness[];
  onAnalyze: () => Promise<void>;
  hasProfile: boolean;
}

export default function ReadinessPanel({ roles, companies, onAnalyze, hasProfile }: ReadinessPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'roles' | 'companies'>('roles');
  const [selectedRole, setSelectedRole] = useState<CareerRole>('Backend');
  const [selectedCompany, setSelectedCompany] = useState<TargetCompany>('Google');
  const [isLoading, setIsLoading] = useState(false);

  const handleRecalculate = async () => {
    setIsLoading(true);
    try {
      await onAnalyze();
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: CareerRole) => {
    switch (role) {
      case 'Backend': return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'Frontend': return <Cpu className="w-5 h-5 text-indigo-600" />;
      case 'Full Stack': return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      case 'AI/ML': return <Award className="w-5 h-5 text-indigo-600" />;
    }
  };

  const currentRoleDetails = roles.find(r => r.role === selectedRole);
  const currentCompanyDetails = companies.find(c => c.company === selectedCompany);

  return (
    <div className="space-y-6" id="readiness-panel">
      
      {/* Header and Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-sans text-base font-semibold text-gray-900 mb-1">
            Hiring Eligibility & Readiness Matrix
          </h3>
          <p className="text-xs text-gray-500 font-sans">
            Compares candidate coding stats, portfolio diversity, and resume ATS logs to grade job placement eligibility.
          </p>
        </div>

        {hasProfile ? (
          <button
            onClick={handleRecalculate}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Re-scoring Matrix...' : 'Re-calculate Readiness'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-sans flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
            <span>Integrate your accounts to run full readiness analysis.</span>
          </div>
        )}
      </div>

      {roles.length > 0 && companies.length > 0 && (
        <>
          {/* Sub Tab selection */}
          <div className="flex border-b border-gray-200" id="readiness-subtabs">
            <button
              onClick={() => setActiveSubTab('roles')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 font-sans transition ${
                activeSubTab === 'roles' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Role-Specific Readiness
            </button>
            <button
              onClick={() => setActiveSubTab('companies')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 font-sans transition ${
                activeSubTab === 'companies' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Company Eligibility Rubrics
            </button>
          </div>

          {activeSubTab === 'roles' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Role Select Bar */}
              <div className="lg:col-span-1 space-y-2">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h4 className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Target Job Roles
                  </h4>

                  <div className="space-y-1.5">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => setSelectedRole(r.role)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border font-sans text-left transition ${
                          selectedRole === r.role 
                            ? 'border-indigo-200 bg-indigo-50/40 text-indigo-900 font-semibold' 
                            : 'border-gray-100 hover:border-gray-200 text-gray-600 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getRoleIcon(r.role)}
                          <span className="text-xs">{r.role} Engineer</span>
                        </div>
                        <span className={`text-xs font-mono font-semibold ${
                          r.readinessScore >= 75 ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {r.readinessScore}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role details explanation */}
              {currentRoleDetails && (
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Readiness Summary Bar */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-sans text-base font-semibold text-gray-900">
                          {currentRoleDetails.role} Placement Preparedness
                        </h4>
                        <p className="text-xs text-gray-400 font-sans">
                          A detailed skill-gap assessment based on developer profiles.
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-3xl font-bold text-gray-900">{currentRoleDetails.readinessScore}%</div>
                        <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Eligibility rating</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${currentRoleDetails.readinessScore >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        style={{ width: `${currentRoleDetails.readinessScore}%` }} 
                      />
                    </div>
                  </div>

                  {/* Strengths & Weaknesses Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/40 border border-emerald-150 rounded-xl p-5 shadow-sm text-xs font-sans">
                      <h5 className="font-semibold text-emerald-900 uppercase tracking-wide text-[10px] mb-3">
                        Role Strengths Detected
                      </h5>
                      <div className="space-y-2">
                        {currentRoleDetails.strengths.map((str, idx) => (
                          <div key={idx} className="flex gap-2 items-start text-emerald-950">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-amber-50/40 border border-amber-150 rounded-xl p-5 shadow-sm text-xs font-sans">
                      <h5 className="font-semibold text-amber-900 uppercase tracking-wide text-[10px] mb-3">
                        Hiring Liabilities / Gaps
                      </h5>
                      <div className="space-y-2 text-amber-950">
                        {currentRoleDetails.weaknesses.map((weak, idx) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{weak}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Missing technology stacks checklist & Action list */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-xs font-sans">
                    <h5 className="font-semibold text-gray-900 mb-3 uppercase tracking-wide text-[10px]">
                      Required Technologies Lacking In Active Repositories
                    </h5>
                    
                    <div className="flex flex-wrap gap-2 mb-5">
                      {currentRoleDetails.missingTech.map((tech) => (
                        <span key={tech} className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[10px] font-mono font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <h5 className="font-semibold text-gray-900 mb-3 uppercase tracking-wide text-[10px] border-t border-gray-100 pt-4">
                      Placement Cell Recommendation Plan
                    </h5>
                    <div className="space-y-2">
                      {currentRoleDetails.improvementPlan.map((step, idx) => (
                        <div key={idx} className="flex gap-2 text-gray-600 leading-relaxed">
                          <span className="font-mono font-semibold text-indigo-600 min-w-[12px]">{idx+1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Company Selector */}
              <div className="lg:col-span-1 space-y-2">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h4 className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Employer Rubrics
                  </h4>

                  <div className="space-y-1.5">
                    {companies.map((c) => (
                      <button
                        key={c.company}
                        onClick={() => setSelectedCompany(c.company)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border font-sans text-left transition ${
                          selectedCompany === c.company 
                            ? 'border-indigo-200 bg-indigo-50/40 text-indigo-900 font-semibold' 
                            : 'border-gray-100 hover:border-gray-200 text-gray-600 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${c.isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-xs">{c.company}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-gray-700">
                          {c.readinessScore}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Rubrics visualizer and feedback */}
              {currentCompanyDetails && (
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Employer Header */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-sans text-base font-semibold text-gray-900">
                          {currentCompanyDetails.company} Interview Standard
                        </h4>
                        <p className="text-xs text-gray-400 font-sans">
                          Eligibility compliance check mapped to standard hiring bar priorities.
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-1 text-[10px] font-semibold font-sans rounded-full ${
                          currentCompanyDetails.isReady 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' 
                            : 'bg-amber-50 text-amber-600 border border-amber-150'
                        }`}>
                          {currentCompanyDetails.isReady ? 'Highly Eligible' : 'Gaps Detected'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 font-sans leading-relaxed bg-gray-50/50 p-3.5 border border-gray-150 rounded-lg">
                      {currentCompanyDetails.explanation}
                    </p>
                  </div>

                  {/* Weighted Priorities Panel */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm font-sans text-xs">
                    <h5 className="font-semibold text-gray-900 mb-4 uppercase tracking-wide text-[10px] flex items-center gap-1">
                      <Target className="w-4 h-4 text-indigo-500" />
                      <span>Interview Scoring Weight Distribution</span>
                    </h5>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>Algorithmic DSA Competence</span>
                          <span className="font-semibold text-gray-800">{currentCompanyDetails.rubricScores.dsaWeight}% Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${currentCompanyDetails.rubricScores.dsaWeight}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>Portfolio Project Quality & Code Reviews</span>
                          <span className="font-semibold text-gray-800">{currentCompanyDetails.rubricScores.projectWeight}% Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full" style={{ width: `${currentCompanyDetails.rubricScores.projectWeight}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>System Architectural Design</span>
                          <span className="font-semibold text-gray-800">{currentCompanyDetails.rubricScores.systemDesignWeight}% Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-700 h-full" style={{ width: `${currentCompanyDetails.rubricScores.systemDesignWeight}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>Resume ATS Keyword Sourcing</span>
                          <span className="font-semibold text-gray-800">{currentCompanyDetails.rubricScores.resumeWeight}% Weight</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full" style={{ width: `${currentCompanyDetails.rubricScores.resumeWeight}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
}
