/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  Code, 
  FileText, 
  Award, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Download
} from 'lucide-react';
import { DevScopeState, CareerRole, TargetCompany } from '../types';

interface DashboardOverviewProps {
  state: DevScopeState;
  onNavigate: (tab: string) => void;
  onRefreshAll: () => void;
}

export default function DashboardOverview({ state, onNavigate, onRefreshAll }: DashboardOverviewProps) {
  const { github, leetcode, resume, overallScore, activities, roleReadiness, companyReadiness } = state;

  const handleDownloadCSV = () => {
    if (!activities || activities.length === 0) return;

    // Headers
    const headers = ['Activity ID', 'Module / Component', 'Action Performed', 'Timestamp (UTC)', 'Details'];
    
    // Rows
    const rows = activities.map(log => [
      log.id,
      log.module || 'N/A',
      // Escape quotes and wrap in quotes to handle commas inside text
      `"${log.action.replace(/"/g, '""')}"`,
      log.timestamp,
      log.details ? `"${log.details.replace(/"/g, '""')}"` : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create browser blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `devscope_activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare radar chart data representing overall category competence
  const radarData = [
    { subject: 'GitHub Projects', A: github?.overallGitHubScore || 30, fullMark: 100 },
    { subject: 'DSA & Algorithms', A: leetcode?.overallLeetCodeScore || 30, fullMark: 100 },
    { subject: 'Resume Quality (ATS)', A: resume?.atsScore || 35, fullMark: 100 },
    { subject: 'Role Readiness', A: Math.round(roleReadiness.reduce((sum, r) => sum + r.readinessScore, 0) / (roleReadiness.length || 4)), fullMark: 100 },
    { subject: 'Company Compliance', A: Math.round(companyReadiness.reduce((sum, c) => sum + c.readinessScore, 0) / (companyReadiness.length || 8)), fullMark: 100 },
  ];

  // LeetCode solved bar data
  const lcBarData = [
    { name: 'Easy', Solved: leetcode?.easySolved || 0, Color: '#10B981' },
    { name: 'Medium', Solved: leetcode?.mediumSolved || 0, Color: '#F59E0B' },
    { name: 'Hard', Solved: leetcode?.hardSolved || 0, Color: '#EF4444' },
  ];

  // Map state to company readiness lists
  const sortedCompanies = [...companyReadiness].sort((a, b) => b.readinessScore - a.readinessScore);

  // Status mapping
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreBadgeText = (score: number) => {
    if (score >= 80) return 'Highly Competitive';
    if (score >= 60) return 'Placement Ready';
    return 'Gaps Detected';
  };

  return (
    <div className="space-y-8" id="dashboard-overview">
      
      {/* Dynamic Duo-Tone Command Heading Block */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#F97316] to-[#EA580C]" />
        <div className="space-y-1.5">
          <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase inline-block">
            🎯 Professional Placement Assessment Cell
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Track, analyze & <span className="bg-gradient-to-r from-[#F97316] to-[#EA580C] bg-clip-text text-transparent">share your competence</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-sans leading-relaxed max-w-2xl">
            Unifies commit footprints, algorithmic complexity ratings, and ATS keywords to benchmark your candidacy against top tier placement standards.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0 z-10">
          <button 
            onClick={onRefreshAll}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-98"
          >
            <Zap className="w-4 h-4 text-[#F97316]" />
            <span>Recalculate Indices</span>
          </button>
        </div>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="overview-bento-grid">
        
        {/* Bento Card 1: Employability Index (Dominant, Wide Hero Feature Card) */}
        <div className="md:col-span-2 lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle Vector Background Grid in the corner */}
          <div className="absolute right-0 bottom-0 w-44 h-44 opacity-20 pointer-events-none dot-matrix rounded-br-2xl" />
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-300" />
          
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold font-sans uppercase tracking-wider px-2.5 py-1 rounded-md">
                  Primary Placement Vector
                </span>
                <h3 className="font-sans font-black text-xl text-slate-900 mt-2.5">
                  Employability Readiness Index
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Aggregated placement compliance indicator scoring code, algorithms, and resume.
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Huge dynamic metric & orange gradient progress bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-6 items-center">
              <div className="sm:col-span-5 flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black text-slate-900 font-sans tracking-tight">
                    {overallScore}%
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 border rounded-full font-bold font-sans uppercase tracking-wider ${getScoreColorClass(overallScore)}`}>
                    {getScoreBadgeText(overallScore)}
                  </span>
                </div>
                
                <span className="text-[11px] text-slate-400 font-sans mt-3 block">
                  Current Target Indicator: <strong className="text-slate-700">80%+</strong> for Tier-1 corporate roles.
                </span>
              </div>

              {/* Contributing indices */}
              <div className="sm:col-span-7 space-y-2.5 bg-slate-50/50 border border-slate-100/80 rounded-xl p-4">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans mb-1.5 flex justify-between items-center">
                  <span>Sub-Index Components</span>
                  <span className="text-indigo-600">Weighted Average</span>
                </h4>
                
                <div className="space-y-2 text-xs font-sans">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>GitHub Engineering footprints (30%)</span>
                      <span className="font-bold text-slate-800">{github ? `${github.overallGitHubScore}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${github?.overallGitHubScore || 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>LeetCode Data Structures & Alg (40%)</span>
                      <span className="font-bold text-slate-800">{leetcode ? `${leetcode.overallLeetCodeScore}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${leetcode?.overallLeetCodeScore || 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>ATS Resume Keyword Standard (30%)</span>
                      <span className="font-bold text-slate-800">{resume ? `${resume.atsScore}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${resume?.atsScore || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Custom High-Contrast Warm Amber Orange Accent Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/40">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] transition-all duration-1000" 
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 font-sans pt-3 mt-4 border-t border-slate-100 flex justify-between items-center">
            <span>Corporate hiring threshold compatibility</span>
            <span className="font-bold text-slate-900">Deterministic Grade A</span>
          </div>
        </div>

        {/* Bento Card 2: Resume Audit Panel Integration */}
        <div 
          onClick={() => onNavigate('resume')}
          className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 font-bold font-sans uppercase tracking-wider px-2 py-0.5 rounded-md">
                ATS Screening
              </span>
              <h3 className="font-sans font-black text-base text-slate-900 mt-2">
                Resume ATS Grade
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {resume ? (
            <div className="my-5 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-slate-900 font-sans">
                  {resume.atsScore}%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Optimized</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-tight">
                {resume.skills.length} technical competencies successfully extracted from document.
              </p>
            </div>
          ) : (
            <div className="my-5">
              {/* Reworked Empty / Initial state with Minimalist Stacked Graphic Frames */}
              <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-slate-200/40 rounded-full blur-lg" />
                <div className="flex gap-1.5 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                  ⚠️ Resume Missing
                </span>
                <span className="text-[9px] text-slate-400 font-sans mt-1.5">
                  Click to integrate PDF/Word
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-indigo-600 group-hover:underline font-bold font-sans pt-3 border-t border-slate-100 flex justify-between items-center">
            <span>Review keyword gaps</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Bento Card 3: GitHub Engine footprint */}
        <div 
          onClick={() => onNavigate('github')}
          className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300" />
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold font-sans uppercase tracking-wider px-2 py-0.5 rounded-md">
                Production Integrity
              </span>
              <h3 className="font-sans font-black text-base text-slate-900 mt-2">
                GitHub Repository Score
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Code className="w-5 h-5" />
            </div>
          </div>

          {github ? (
            <div className="my-5 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-slate-900 font-sans">
                  {github.overallGitHubScore}%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Active Scan</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-tight">
                Evaluating {github.repositories.length} public repos. Commits and testing structures analyzed.
              </p>
            </div>
          ) : (
            <div className="my-5">
              {/* Reworked Empty / Initial state with Minimalist Stacked Graphic Frames */}
              <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-slate-200/40 rounded-full blur-lg" />
                <div className="flex gap-1 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                  ⚠️ Profile Inactive
                </span>
                <span className="text-[9px] text-slate-400 font-sans mt-1.5">
                  Link GitHub credentials
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-indigo-600 group-hover:underline font-bold font-sans pt-3 border-t border-slate-100 flex justify-between items-center">
            <span>View commit frequencies</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Bento Card 4: LeetCode DSA Problem Solving */}
        <div 
          onClick={() => onNavigate('leetcode')}
          className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all duration-300" />
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-700 font-bold font-sans uppercase tracking-wider px-2 py-0.5 rounded-md">
                Algorithm Practice
              </span>
              <h3 className="font-sans font-black text-base text-slate-900 mt-2">
                LeetCode DSA Index
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {leetcode ? (
            <div className="my-5 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-slate-900 font-sans">
                  {leetcode.overallLeetCodeScore}%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Ready</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-tight">
                {leetcode.totalSolved} overall algorithmic problems scanned. High confidence in complexity recurrence models.
              </p>
            </div>
          ) : (
            <div className="my-5">
              {/* Reworked Empty / Initial state with Minimalist Stacked Graphic Frames */}
              <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute -right-3 -bottom-3 w-12 h-12 bg-slate-200/40 rounded-full blur-lg" />
                <div className="flex gap-1 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                  ⚠️ Profile Inactive
                </span>
                <span className="text-[9px] text-slate-400 font-sans mt-1.5">
                  Link LeetCode statistics
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-indigo-600 group-hover:underline font-bold font-sans pt-3 border-t border-slate-100 flex justify-between items-center">
            <span>View LeetCode breakdown</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Bento Card 5: LeetCode DSA Breakdown vs Target (Bar) */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold font-sans uppercase tracking-wider px-2.5 py-1 rounded-md">
              Complexity Density
            </span>
            <h3 className="font-sans font-black text-lg text-slate-900 mt-2">
              DSA Problem Density by Difficulty
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Active code submission categories mapped against corporate expectation guidelines.
            </p>
          </div>
          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lcBarData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter', fontWeight: 500 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0F172A', fontFamily: 'Inter' }}
                  itemStyle={{ fontFamily: 'Inter', fontSize: 11 }}
                />
                <Bar dataKey="Solved" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {lcBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento Card 6: Employability Competence Vector (Radar) */}
        <div className="md:col-span-2 lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold font-sans uppercase tracking-wider px-2.5 py-1 rounded-md">
              Portfolio Integrity
            </span>
            <h3 className="font-sans font-black text-lg text-slate-900 mt-2">
              Employability Competence Vector
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Dynamic multi-dimensional mapping comparing current profile dimensions with strict recruiter standards.
            </p>
          </div>
          <div className="h-64 w-full mt-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#F1F5F9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                <Radar 
                  name="Score" 
                  dataKey="A" 
                  stroke="#6366F1" 
                  fill="#818CF8" 
                  fillOpacity={0.18} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento Card 7: Activity Timeline */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute right-2 top-2 opacity-5 pointer-events-none">
            <Clock className="w-16 h-16 text-slate-900" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-bold font-sans uppercase tracking-wider px-2 py-0.5 rounded-md">
                Telemetry Log
              </span>
              {activities && activities.length > 0 && (
                <button
                  id="download-activities-csv"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50"
                  title="Download all activities as a CSV file"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              )}
            </div>
            <h3 className="font-sans font-black text-base text-slate-900 mt-2">
              Evaluation Timeline
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Candidate audit events captured.
            </p>
          </div>

          <div className="my-5 flex-1 space-y-4 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin">
            {activities.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-10 font-sans">
                No recent workspace updates.
              </div>
            ) : (
              activities.slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="p-1 rounded bg-slate-100 text-slate-600 border border-slate-200/40">
                      <Clock className="w-3 h-3" />
                    </div>
                    <div className="w-0.5 flex-1 bg-slate-100 my-1.5" />
                  </div>
                  <div className="flex-1 font-sans">
                    <div className="font-bold text-slate-800 leading-tight">
                      {log.action}
                    </div>
                    <div className="text-slate-400 text-[9px] mt-0.5 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-sans pt-2.5 border-t border-slate-100">
            Realtime security audit connection.
          </div>
        </div>

        {/* Bento Card 8: Company-Specific Eligibility Analysis */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <span className="text-[10px] bg-orange-50 border border-orange-100 text-orange-700 font-bold font-sans uppercase tracking-wider px-2.5 py-1 rounded-md">
                Corporate Alignment Matrix
              </span>
              <h3 className="font-sans font-black text-xl text-slate-900 mt-2.5">
                Target Corporate Placement Rubrics
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Determines candidate placement eligibility matches compiled against technical requirement lists.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('readiness')}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 font-sans bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100/40 transition shrink-0"
            >
              <span>Launch Readiness Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid of Company slots - Extremely premium design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedCompanies.slice(0, 6).map((c, idx) => (
              <div 
                key={c.company}
                className="flex flex-col justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:border-slate-200/80 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                    <span className="font-sans font-extrabold text-sm text-slate-800">{c.company}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-slate-800">
                    {c.readinessScore}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${c.readinessScore >= 75 ? 'from-emerald-400 to-teal-500' : 'from-orange-400 to-[#F97316]'}`} 
                      style={{ width: `${c.readinessScore}%` }} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                    <span>Target Compliance</span>
                    <span className={`font-bold ${c.readinessScore >= 75 ? 'text-emerald-600' : 'text-[#F97316]'}`}>
                      {c.readinessScore >= 75 ? '● Highly Aligned' : '● In Evaluation'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
