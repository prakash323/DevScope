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
    <div className="space-y-6" id="dashboard-overview">
      
      {/* Top Banner Message */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-sans text-xl font-semibold tracking-tight text-gray-900">
            Welcome Back, {state.user?.fullName}!
          </h2>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Your placement preparedness profile is currently evaluated at <strong className="text-indigo-600">{overallScore}%</strong> of target hiring bars.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRefreshAll}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Re-Analysis</span>
          </button>
        </div>
      </div>

      {/* Main Stats Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="main-metrics">
        
        {/* Metric 1: Overall Employability */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              Employability Index
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
              {overallScore}%
            </span>
            <span className={`text-[10px] ml-2 px-1.5 py-0.5 border rounded-full ${getScoreColorClass(overallScore)}`}>
              {getScoreBadgeText(overallScore)}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-sans pt-2 border-t border-gray-100 flex justify-between items-center">
            <span>Aggregated index</span>
            <span className="font-medium text-gray-900">100% target</span>
          </div>
        </div>

        {/* Metric 2: GitHub score */}
        <div 
          onClick={() => onNavigate('github')}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              GitHub Engineering
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Code className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
              {github ? `${github.overallGitHubScore}%` : '—'}
            </span>
            <span className="text-[10px] text-gray-400 font-sans ml-2">
              {github ? `${github.repositories.length} repos scanned` : 'Not Connected'}
            </span>
          </div>
          <div className="text-xs text-[#4F46E5] hover:underline font-medium font-sans pt-2 border-t border-gray-100 flex justify-between items-center">
            <span>View repository gaps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 3: LeetCode score */}
        <div 
          onClick={() => onNavigate('leetcode')}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              LeetCode DSA
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
              {leetcode ? `${leetcode.overallLeetCodeScore}%` : '—'}
            </span>
            <span className="text-[10px] text-gray-400 font-sans ml-2">
              {leetcode ? `${leetcode.totalSolved} Solved` : 'Not Connected'}
            </span>
          </div>
          <div className="text-xs text-[#4F46E5] hover:underline font-medium font-sans pt-2 border-t border-gray-100 flex justify-between items-center">
            <span>View DSA coverage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 4: Resume score */}
        <div 
          onClick={() => onNavigate('resume')}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              Resume ATS Score
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
              {resume ? `${resume.atsScore}%` : '—'}
            </span>
            <span className="text-[10px] text-gray-400 font-sans ml-2">
              {resume ? `${resume.skills.length} skills parsed` : 'Not Uploaded'}
            </span>
          </div>
          <div className="text-xs text-[#4F46E5] hover:underline font-medium font-sans pt-2 border-t border-gray-100 flex justify-between items-center">
            <span>View ATS audit report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="overview-charts">
        
        {/* Chart Card 1: Employability Competence Vector (Radar) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-base font-semibold text-gray-900">
              Employability Competence Vector
            </h3>
            <p className="text-xs text-gray-500 font-sans">
              Dynamic multi-dimensional mapping comparing current profiles with recruiter guidelines.
            </p>
          </div>
          <div className="h-72 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'Inter' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                <Radar 
                  name="Score" 
                  dataKey="A" 
                  stroke="#4F46E5" 
                  fill="#818CF8" 
                  fillOpacity={0.25} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Card 2: LeetCode DSA Breakdown vs Target (Bar) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-base font-semibold text-gray-900">
              DSA Problem Density by Difficulty
            </h3>
            <p className="text-xs text-gray-500 font-sans">
              Analysis of active code submission distribution compared to placement standards.
            </p>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lcBarData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 11 }} />
                <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Bar dataKey="Solved" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {lcBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Target Companies & Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="company-status-panels">
        
        {/* Panel 1: Top Company Compliance list */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-sans text-base font-semibold text-gray-900">
                Company-Specific Eligibility Analysis
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                Real-time compliance checks based on customized interview scoring rubrics.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('readiness')}
              className="text-xs text-[#4F46E5] font-semibold hover:underline flex items-center font-sans"
            >
              <span>View details</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedCompanies.slice(0, 6).map((c, idx) => (
              <div 
                key={c.company}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="font-sans font-medium text-sm text-gray-800">{c.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${c.readinessScore >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${c.readinessScore}%` }} 
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-gray-700 min-w-[28px] text-right">
                    {c.readinessScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Activity Log Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-sans text-base font-semibold text-gray-900">
              Evaluation Timeline
            </h3>
            {activities && activities.length > 0 && (
              <button
                id="download-activities-csv"
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100/80"
                title="Download all activities as a CSV file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-1">
            {activities.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-10 font-sans">
                No recent workspace updates.
              </div>
            ) : (
              activities.slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-2.5 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                      <Clock className="w-3 h-3" />
                    </div>
                    <div className="w-0.5 flex-1 bg-gray-100 my-1" />
                  </div>
                  <div className="flex-1 font-sans">
                    <div className="font-medium text-gray-800 leading-tight">
                      {log.action}
                    </div>
                    <div className="text-gray-400 text-[10px] mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
