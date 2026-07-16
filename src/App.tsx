/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Code, 
  FileText, 
  TrendingUp, 
  Award, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  LogOut, 
  User, 
  Layers, 
  Download,
  Flame,
  LayoutDashboard
} from 'lucide-react';

import { DevScopeState, User as UserType, RoadmapItem, SkillValidation, GitHubProfile, LeetCodeProfile, ResumeData, ActivityLog } from './types';
import AuthScreen from './components/AuthScreen';
import DashboardOverview from './components/DashboardOverview';
import GitHubPanel from './components/GitHubPanel';
import LeetCodePanel from './components/LeetCodePanel';
import ResumePanel from './components/ResumePanel';
import ValidationPanel from './components/ValidationPanel';
import ReadinessPanel from './components/ReadinessPanel';
import RoadmapPanel from './components/RoadmapPanel';
import PDFReport from './components/PDFReport';

// Starting initial mock activities for a pristine placeholder state
const defaultActivities: ActivityLog[] = [
  { id: 'act-1', action: 'Created placement profile candidate session.', module: 'AUTH', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'act-2', action: 'DevScope platform initialized core rule matrices.', module: 'SYSTEM', timestamp: new Date().toISOString() }
];

export default function App() {
  const [state, setState] = useState<DevScopeState>(() => {
    const cached = localStorage.getItem('devscope_workspace_state');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error('Failed to parse cached DevScope state:', err);
      }
    }
    return {
      user: null,
      github: null,
      leetcode: null,
      resume: null,
      skillValidation: [],
      roleReadiness: [],
      companyReadiness: [],
      roadmap: null,
      activities: defaultActivities,
      overallScore: 0
    };
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [showReport, setShowReport] = useState(false);

  // Sync state to local storage for robust persistence across reloads
  useEffect(() => {
    localStorage.setItem('devscope_workspace_state', JSON.stringify(state));
  }, [state]);

  // Recalculate the overall score whenever profiles change
  useEffect(() => {
    if (!state.user) return;
    
    let totalScore = 40; // Default baseline employability score
    let componentsCount = 1;

    if (state.github) {
      totalScore += state.github.overallGitHubScore;
      componentsCount++;
    }
    if (state.leetcode) {
      totalScore += state.leetcode.overallLeetCodeScore;
      componentsCount++;
    }
    if (state.resume) {
      totalScore += state.resume.atsScore;
      componentsCount++;
    }

    const calculatedOverall = Math.round(totalScore / componentsCount);
    
    if (calculatedOverall !== state.overallScore) {
      setState(prev => ({
        ...prev,
        overallScore: calculatedOverall
      }));
    }
  }, [state.github, state.leetcode, state.resume]);

  const handleLogin = (user: UserType) => {
    const log: ActivityLog = {
      id: `act-log-${Date.now()}`,
      action: `Student logged in: ${user.fullName}`,
      module: 'AUTH',
      timestamp: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      user,
      activities: [log, ...prev.activities]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('devscope_workspace_state');
    setState({
      user: null,
      github: null,
      leetcode: null,
      resume: null,
      skillValidation: [],
      roleReadiness: [],
      companyReadiness: [],
      roadmap: null,
      activities: defaultActivities,
      overallScore: 0
    });
    setActiveTab('overview');
    setShowReport(false);
  };

  // Log an activity safely
  const logActivity = (action: string, module: 'AUTH' | 'GITHUB' | 'LEETCODE' | 'RESUME' | 'ROADMAP' | 'SYSTEM') => {
    const newLog: ActivityLog = {
      id: `act-log-${Date.now()}`,
      action,
      module,
      timestamp: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      activities: [newLog, ...prev.activities]
    }));
  };

  // API Call Integration: GitHub Analyzer
  const handleGitHubAnalyze = async (username: string) => {
    const res = await fetch('/api/github/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'GitHub analysis trigger failed.');
    }

    const data = await res.json();
    
    setState(prev => ({
      ...prev,
      github: data.profile,
      // If we already have skills parsed, let's keep them in memory
      activities: [{
        id: `act-git-${Date.now()}`,
        action: `Analyzed GitHub profile: @${username} (Score: ${data.profile.overallGitHubScore}%)`,
        module: 'GITHUB',
        timestamp: new Date().toISOString()
      }, ...prev.activities]
    }));
  };

  // API Call Integration: LeetCode Import
  const handleLeetCodeAnalyze = async (username: string, customStats?: any) => {
    const res = await fetch('/api/leetcode/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, customStats })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'LeetCode analysis trigger failed.');
    }

    const data = await res.json();

    setState(prev => ({
      ...prev,
      leetcode: data.profile,
      activities: [{
        id: `act-lc-${Date.now()}`,
        action: `Imported LeetCode stats for @${username} (${data.profile.totalSolved} solved)`,
        module: 'LEETCODE',
        timestamp: new Date().toISOString()
      }, ...prev.activities]
    }));
  };

  // API Call Integration: Resume Parsing
  const handleResumeAnalyze = async (resumeText: string, fileName?: string) => {
    const res = await fetch('/api/resume/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, fileName })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Resume parsing failed.');
    }

    const data = await res.json();

    setState(prev => ({
      ...prev,
      resume: data,
      activities: [{
        id: `act-res-${Date.now()}`,
        action: `Uploaded and parsed resume: ${fileName || 'Pasted Resume'} (ATS: ${data.atsScore}%)`,
        module: 'RESUME',
        timestamp: new Date().toISOString()
      }, ...prev.activities]
    }));
  };

  // API Call Integration: Resume Validation Cross-reference Audit
  const handleRunValidation = async () => {
    if (!state.resume || !state.github) return;

    const res = await fetch('/api/resume/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeSkills: state.resume.skills,
        githubRepos: state.github.repositories,
        leetcodeProfile: state.leetcode
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Skill validation audit failed.');
    }

    const data = await res.json();

    setState(prev => ({
      ...prev,
      skillValidation: data.skillValidation,
      activities: [{
        id: `act-val-${Date.now()}`,
        action: `Ran Skill-to-Code validation audit (${data.skillValidation.filter((v: any) => v.status === 'Verified').length} skills verified)`,
        module: 'SYSTEM',
        timestamp: new Date().toISOString()
      }, ...prev.activities]
    }));
  };

  // API Call Integration: Role & Company Matrix
  const handleCalculateReadiness = async () => {
    const res = await fetch('/api/readiness/roles-companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        github: state.github,
        leetcode: state.leetcode,
        resume: state.resume
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Readiness matrix calculations failed.');
    }

    const data = await res.json();

    setState(prev => ({
      ...prev,
      roleReadiness: data.roleScores,
      companyReadiness: data.companyReadiness,
      activities: [{
        id: `act-mat-${Date.now()}`,
        action: 'Recalculated Hiring Readiness & Employer Rubric compliance indices.',
        module: 'SYSTEM',
        timestamp: new Date().toISOString()
      }, ...prev.activities]
    }));
  };

  // API Call Integration: Generate personalized roadmap
  const handleGenerateRoadmap = async (role: string) => {
    const missing = state.roleReadiness.find(r => r.role === role)?.missingTech || [];
    const skills = state.resume?.skills || [];

    const res = await fetch('/api/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills,
        missingTech: missing,
        targetRole: role
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Roadmap generator engine failed.');
    }

    const data = await res.json();

    setState(prev => ({
      ...prev,
      roadmap: data.roadmap,
      activities: [{
        id: `act-rm-${Date.now()}`,
        action: `Generated personalized 8-Week study roadmap for ${role} placement tracks.`,
        module: 'ROADMAP',
        timestamp: new Date().toISOString()
      }, ...prev.activities]
    }));
  };

  // Roadmap task checklist toggle
  const handleToggleTask = (weekNum: number, taskId: string) => {
    if (!state.roadmap) return;

    const updatedRoadmap = state.roadmap.map(week => {
      if (week.week === weekNum) {
        return {
          ...week,
          tasks: week.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          })
        };
      }
      return week;
    });

    setState(prev => ({
      ...prev,
      roadmap: updatedRoadmap
    }));
  };

  // Fallback triggers to populate pre-analyzed state on initial load
  const handlePrepopulateDemo = async () => {
    try {
      await handleGitHubAnalyze('prakash_vitap');
      await handleLeetCodeAnalyze('prakash_vitap');
      await handleResumeAnalyze(
        `Prakash Kumar\nEmail: prakash.23bce9564@vitapstudent.ac.in\n\nSkills: TypeScript, JavaScript, React, Node.js, Express, MongoDB, C++, Algorithms, OOP, Docker, SQL\n\nProjects:\nE-Commerce Microservice - Scalable platform built with Node.js and Docker.\nAI News Platform - React site translating articles in real-time.\n\nExperience: University lab leader 2025.`,
        'prakash_resume.txt'
      );
      // Automatically chain validation, readiness, and roadmap calculations
      setTimeout(async () => {
        const cachedState = JSON.parse(localStorage.getItem('devscope_workspace_state') || '{}');
        // Audits
        const valRes = await fetch('/api/resume/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeSkills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'C++', 'SQL'],
            githubRepos: cachedState.github?.repositories || [],
            leetcodeProfile: cachedState.leetcode
          })
        });
        const valData = await valRes.json();

        const matRes = await fetch('/api/readiness/roles-companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            github: cachedState.github,
            leetcode: cachedState.leetcode,
            resume: cachedState.resume
          })
        });
        const matData = await matRes.json();

        setState(prev => ({
          ...prev,
          skillValidation: valData.skillValidation,
          roleReadiness: matData.roleScores,
          companyReadiness: matData.companyReadiness,
        }));
      }, 500);

    } catch (err) {
      console.error('Demonstration prep failed:', err);
    }
  };

  // Render Auth screen first if no candidate session is active
  if (!state.user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Render printable full PDF document if report modal is triggered
  if (showReport) {
    return (
      <div className="bg-[#F3F4F6] min-h-screen p-6">
        <PDFReport state={state} onBack={() => setShowReport(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between" id="app-workspace">
      
      {/* Top Header Row */}
      <header className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-[#E5E7EB] bg-white print:hidden">
        
        {/* Branding */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded text-white flex items-center justify-center">
            <Code className="w-5 h-5" />
          </div>
          <span className="font-sans font-semibold tracking-tight text-xl text-gray-900">
            DevScope
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-mono">
            V1.0-LIVE
          </span>
        </div>

        {/* Action controls & Prepopulate Demo */}
        <div className="flex items-center gap-3">
          
          {/* Quick populate sandbox button to speed up user audits */}
          {!state.github && (
            <button
              onClick={handlePrepopulateDemo}
              className="px-3 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold font-sans transition cursor-pointer"
            >
              Populate Candidate Demo
            </button>
          )}

          {/* PDF Report trigger */}
          <button
            onClick={() => {
              if (!state.github || !state.leetcode || !state.resume) {
                alert('Please connect your profiles (GitHub, LeetCode, Resume) first to generate a professional PDF placement report.');
                return;
              }
              setShowReport(true);
            }}
            className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold font-sans transition flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Report PDF</span>
          </button>

          {/* User logout */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-gray-800 font-sans leading-none">{state.user.fullName}</div>
              <span className="text-[10px] text-gray-400 font-sans mt-0.5 inline-block">{state.user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out Session"
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </header>

      {/* Primary Tab Navigation Row */}
      <nav className="border-b border-[#E5E7EB] bg-white px-6 print:hidden">
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'github', label: 'GitHub Projects', icon: <Code className="w-4 h-4" /> },
            { id: 'leetcode', label: 'LeetCode DSA', icon: <Flame className="w-4 h-4" /> },
            { id: 'resume', label: 'Resume Audit', icon: <FileText className="w-4 h-4" /> },
            { id: 'validation', label: 'Code Validation', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'readiness', label: 'Hiring Eligibility', icon: <Award className="w-4 h-4" /> },
            { id: 'roadmap', label: 'Learning Roadmap', icon: <Calendar className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-3.5 px-1 text-xs font-medium border-b-2 font-sans transition flex-shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Container Viewport */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto print:p-0">
        
        {activeTab === 'overview' && (
          <DashboardOverview 
            state={state} 
            onNavigate={(tab) => setActiveTab(tab)} 
            onRefreshAll={async () => {
              if (state.github) await handleGitHubAnalyze(state.github.username);
              if (state.leetcode) await handleLeetCodeAnalyze(state.leetcode.username);
              if (state.resume) await handleResumeAnalyze(
                `Prakash Kumar\nEmail: prakash.23bce9564@vitapstudent.ac.in\n\nSkills: TypeScript, JavaScript, React, Node.js, Express, MongoDB, C++, Algorithms, OOP, Docker, SQL\n\nProjects:\nE-Commerce Microservice - Scalable platform built with Node.js and Docker.\nAI News Platform - React site translating articles in real-time.\n\nExperience: University lab leader 2025.`,
                'prakash_resume.txt'
              );
              // Run validations
              setTimeout(async () => {
                await handleRunValidation();
                await handleCalculateReadiness();
              }, 500);
            }}
          />
        )}

        {activeTab === 'github' && (
          <GitHubPanel 
            profile={state.github} 
            aiFeedback={state.github ? {
              summary: 'Comprehensive evaluation of repositories reveals a student with reliable programming consistency and solid TypeScript projects.',
              strengths: ['Active microservice development', 'Well-structured package definitions', 'Solid README architectures'],
              weaknesses: ['Lack of unit tests inside repositories', 'Missing CI/CD workflows', 'No active community stars/forks'],
              actionPlan: ['Create a dedicated tests/ directory and configure standard jest runners.', 'Integrate .github/workflows/ci.yml pipelines.', 'Deploy microservices live on Render and document their URL paths.']
            } : null} 
            onAnalyze={handleGitHubAnalyze} 
          />
        )}

        {activeTab === 'leetcode' && (
          <LeetCodePanel 
            profile={state.leetcode} 
            aiFeedback={state.leetcode ? {
              assessment: 'Highly competitive candidate for placement interviews. Solved 150+ medium complexity problems indicating deep algorithmic capacity.',
              recommendedTopics: [
                'Graph traversal cycles (BFS/DFS on Grid structures)',
                'Dynamic Programming memoized caching models',
                'Trie and advanced binary heap algorithms'
              ],
              timeComplexityStrengths: 'Solid comprehension of recursive linear recurrence relation models.'
            } : null} 
            onAnalyze={handleLeetCodeAnalyze} 
          />
        )}

        {activeTab === 'resume' && (
          <ResumePanel 
            resume={state.resume} 
            onAnalyze={handleResumeAnalyze} 
          />
        )}

        {activeTab === 'validation' && (
          <ValidationPanel 
            validation={state.skillValidation} 
            onValidate={handleRunValidation} 
            hasProfile={!!(state.github && state.resume)} 
          />
        )}

        {activeTab === 'readiness' && (
          <ReadinessPanel 
            roles={state.roleReadiness} 
            companies={state.companyReadiness} 
            onAnalyze={handleCalculateReadiness} 
            hasProfile={!!(state.github && state.leetcode && state.resume)} 
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapPanel 
            roadmap={state.roadmap} 
            onGenerate={handleGenerateRoadmap} 
            onToggleTask={handleToggleTask} 
            hasProfile={!!(state.github && state.resume)} 
          />
        )}

      </main>

      {/* Bottom Footer Row */}
      <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-400 bg-white print:hidden space-y-1">
        <div>DevScope © 2026. Designed for Placement Preparation Cells.</div>
        <div>All profile validations are mapped to corporate hiring rubrics.</div>
      </footer>

    </div>
  );
}
