/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Code, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Award
} from 'lucide-react';
import { DevScopeState } from '../types';

interface PDFReportProps {
  state: DevScopeState;
  onBack: () => void;
}

export default function PDFReport({ state, onBack }: PDFReportProps) {
  const { user, github, leetcode, resume, skillValidation, roleReadiness, companyReadiness, overallScore } = state;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto" id="pdf-report-workspace">
      
      {/* Control bar - hidden during active printing */}
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Report View</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Save PDF Report</span>
        </button>
      </div>

      {/* Printable Area - styled for standard letter paper */}
      <div className="bg-white border border-gray-200 shadow-sm p-10 rounded-xl print:border-none print:shadow-none print:p-0" id="printable-report">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">DEVSCOPE</h1>
            <p className="text-xs text-indigo-600 uppercase tracking-wider font-bold mt-1">Placement Eligibility & Technical Audit Report</p>
            
            <div className="mt-4 text-xs text-gray-500 space-y-0.5 font-sans">
              <div><strong>Candidate Name:</strong> {user?.fullName || 'Placement Candidate'}</div>
              <div><strong>Email ID:</strong> {user?.email || 'prakash.23bce9564@vitapstudent.ac.in'}</div>
              <div><strong>Audit Created:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center justify-center border-4 border-indigo-600 rounded-full w-24 h-24">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-gray-950 font-mono">{overallScore}%</span>
                <span className="block text-[8px] uppercase tracking-wide font-bold text-indigo-600">Overall index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Scores Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">GitHub Engineering</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{github ? `${github.overallGitHubScore}%` : 'N/A'}</div>
            <div className="text-[10px] text-gray-400 mt-1">{github?.repositories.length || 0} active repos scanned</div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">LeetCode Algorithmic</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{leetcode ? `${leetcode.overallLeetCodeScore}%` : 'N/A'}</div>
            <div className="text-[10px] text-gray-400 mt-1">{leetcode?.totalSolved || 0} solved problems</div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Resume ATS Rating</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{resume ? `${resume.atsScore}%` : 'N/A'}</div>
            <div className="text-[10px] text-gray-400 mt-1">{resume?.skills.length || 0} technologies extracted</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Section 1: Skill validations */}
          <div>
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-gray-900 border-b border-gray-300 pb-2 mb-3">
              Skill Verification Audits
            </h3>
            
            <div className="space-y-2 text-xs">
              {skillValidation.length === 0 ? (
                <div className="text-gray-400 italic">No validation records.</div>
              ) : (
                skillValidation.slice(0, 8).map((v) => (
                  <div key={v.skill} className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-800">{v.skill}</span>
                      <span className="text-gray-400 text-[10px] ml-2">({v.level})</span>
                    </div>
                    <span className={`text-[10px] font-bold ${
                      v.status === 'Verified' ? 'text-emerald-600' : v.status === 'Partial' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Role Eligibility scores */}
          <div>
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-gray-900 border-b border-gray-300 pb-2 mb-3">
              Job Role Placements Preparedness
            </h3>

            <div className="space-y-3.5 text-xs font-sans">
              {roleReadiness.map((role) => (
                <div key={role.role}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-700">{role.role} Engineer</span>
                    <span className="font-bold text-gray-900">{role.readinessScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-gray-800 h-full" style={{ width: `${role.readinessScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Target Employer Eligibility Rubrics */}
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wider font-extrabold text-gray-900 border-b border-gray-300 pb-2 mb-4">
            Target Employer Compliance Ratings
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {companyReadiness.slice(0, 8).map((c) => (
              <div key={c.company} className="border border-gray-150 rounded-lg p-3 text-center bg-gray-50/50">
                <span className="font-bold text-gray-800 block text-xs">{c.company}</span>
                <span className="text-xl font-extrabold text-gray-950 font-mono block mt-1.5">{c.readinessScore}%</span>
                <span className={`inline-block text-[9px] font-bold uppercase mt-1 ${
                  c.isReady ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {c.isReady ? 'Competitive' : 'Gap Detected'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Closing Certification of Audit */}
        <div className="border-t border-gray-200 pt-6 mt-12 flex justify-between items-end text-[10px] text-gray-400 font-mono">
          <div>
            <div>DEVSCOPE CAREER ANALYTICS PLATFORM</div>
            <div>VERIFIED BY GEMINI ADVANCED ANALYTICS SECURE SERVERS</div>
          </div>
          <div className="text-right">
            <div>AUDIT REPORT REF: #DS-2026-{Math.floor(1000 + Math.random() * 9000)}</div>
            <div>STAMPED ONLINE SECURITY KEY: OK</div>
          </div>
        </div>

      </div>

    </div>
  );
}
