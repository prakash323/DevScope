/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  ExternalLink, 
  Calendar, 
  Sparkles, 
  Building, 
  Clock, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Check,
  ChevronRight,
  Video,
  BookOpen,
  Info,
  Layers,
  CalendarDays,
  CalendarCheck2,
  X
} from 'lucide-react';
import { scheduleCalendarEvent } from '../lib/workspace';

interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  requirements: string[];
  postedDate: string;
  source: string;
}

interface SearchSource {
  title: string;
  uri: string;
}

interface JobOpportunitiesPanelProps {
  targetCompanies: string[];
  preferredRole: string;
  accessToken: string | null;
  onScheduleTaskOnCalendar?: (taskName: string) => void;
}

const AVAILABLE_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 
  'Adobe', 'Oracle', 'Atlassian', 'Netflix', 'Salesforce'
];

// Rich data detailing common interview peak seasons and standard hiring pipelines
const COMPANY_TIMELINES: Record<string, {
  peakSeason: string;
  process: string[];
  focusAreas: string[];
  recommendedPrepDays: number;
  description: string;
}> = {
  'Google': {
    peakSeason: 'September – January (Full-time) | October – March (Internships)',
    process: [
      'Resume Screen & Recruiter Alignment',
      'Technical Phone Screen (1 round, 45 min algorithmic coding)',
      'Virtual Onsite (3 coding rounds focus on algorithms/systems + 1 Googlyness & Leadership round)'
    ],
    focusAreas: ['Graph Algorithms (DFS/BFS, Dijkstra)', 'Dynamic Programming & Recursion', 'Tree Traversals & Hash Maps', 'Scalable System Design'],
    recommendedPrepDays: 30,
    description: 'Focus is heavily geared towards runtime/space complexity estimation, clean structural code, and Googly traits (collaboration, navigating ambiguity).'
  },
  'Amazon': {
    peakSeason: 'August – December (Fall Peak) | January – April (Spring Peak)',
    process: [
      'Online Assessment (2 coding questions + Work Style Simulation)',
      'Technical Phone Screen (1 coding round with LP integration)',
      'Virtual Onsite (4 rounds: Coding, System Architecture, & LP behavioral questions)'
    ],
    focusAreas: ['16 Leadership Principles (critical for ALL rounds)', 'Object-Oriented Design & Design Patterns', 'Distributed System Scalability', 'Data Structures (Trees, Queues, Hash Tables)'],
    recommendedPrepDays: 21,
    description: 'Every round is split 50/50 between deep technical skills and behavioral execution evaluated against the famous Leadership Principles.'
  },
  'Microsoft': {
    peakSeason: 'August – November (University Recruiting) | Year-Round (Experienced)',
    process: [
      'Initial Online Coding Screening (Codility)',
      'Technical Screening (1-2 programming problems)',
      'Virtual Onsite (4 rounds: Live Coding, System Design, and Behavioral alignment)'
    ],
    focusAreas: ['Strings & Arrays manipulation', 'System Design & Distributed Databases', 'Testing, Edge Case coverage, & Code Robustness', 'Core computer science fundamentals'],
    recommendedPrepDays: 15,
    description: 'Value is placed on systematic coding patterns, code completeness, rigorous test-case thinking, and team collaboration.'
  },
  'Meta': {
    peakSeason: 'September – November (Fall Peak) | January – March (Spring Peak)',
    process: [
      'Recruiter Screen & Prep Workshop',
      'Technical Phone Screen (2 coding questions in 45 mins)',
      'Virtual Onsite (2 Coding rounds, 1 System Design round, 1 Behavioral round)'
    ],
    focusAreas: ['High-speed coding execution (2 questions per round)', 'LeetCode-style medium/hard patterns', 'Distributed Systems & Product Architecture', 'Meta Core Values & Ambiguity resolution'],
    recommendedPrepDays: 25,
    description: 'Meta expects rapid, bug-free implementation of algorithmic solutions. Perfect code clarity and optimal time complexity are paramount.'
  },
  'Apple': {
    peakSeason: 'Year-Round (Highly team-specific) | September – December (University)',
    process: [
      'Team Manager Initial Chat',
      'Technical Phone Screen (Focus on core languages e.g. C++, Swift, Python)',
      'Virtual Onsite (5-6 highly customized rounds covering hardware, systems, & coding)'
    ],
    focusAreas: ['Low-level optimization & Memory management', 'Concurrency, Threads & Race Conditions', 'Domain-specific knowledge (embedded, Web, CoreML)', 'Apple core product philosophy'],
    recommendedPrepDays: 20,
    description: 'Apple hiring is highly decentralized and driven directly by specific engineering teams. Focus heavily on details, pride of ownership, and deep language-level internals.'
  },
  'Netflix': {
    peakSeason: 'Year-Round (Experienced focus)',
    process: [
      'Recruiter Screen & Cultural overview',
      'Virtual Technical Screen (Senior coding / system scenarios)',
      'Full Loop (4-5 rounds of technical depth, deep system design, and culture fit)'
    ],
    focusAreas: ['Netflix Culture Memo (absolutely vital)', 'Real-time video streaming architecture', 'High-throughput microservices systems', 'Extreme ownership & communication'],
    recommendedPrepDays: 30,
    description: 'Hiring focuses on high-judgment, senior professionals who embody the values of "Freedom & Responsibility" and show extreme self-sufficiency.'
  },
  'Salesforce': {
    peakSeason: 'September – January',
    process: [
      'HackerRank Assessment',
      'Recruiter & Team Lead screening call',
      'Virtual Loop (3 rounds: System Presentation / Coding, Core Java/C#, and Trust culture)'
    ],
    focusAreas: ['REST API design & Microservices patterns', 'Database indexes and schema design', 'Behavioral alignment (Trust, Customer Success, Innovation)'],
    recommendedPrepDays: 14,
    description: 'Focuses on scalable cloud systems, multi-tenant database designs, and values matching Salesforce’s core values.'
  }
};

export default function JobOpportunitiesPanel({ 
  targetCompanies, 
  preferredRole, 
  accessToken,
  onScheduleTaskOnCalendar 
}: JobOpportunitiesPanelProps) {
  // Navigation tabs: 'listings' or 'scheduler'
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'scheduler'>('listings');

  // Parsed target companies list or fall back to default
  const initialSelected = targetCompanies && targetCompanies.length > 0
    ? targetCompanies.filter(c => AVAILABLE_COMPANIES.includes(c))
    : ['Google', 'Amazon', 'Microsoft', 'Meta'];

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
    initialSelected.length > 0 ? initialSelected : ['Google', 'Amazon', 'Microsoft']
  );
  const [customCompany, setCustomCompany] = useState('');
  const [role, setRole] = useState(preferredRole || 'Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Internship / Entry Level');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<Record<string, boolean>>({});
  const [isFallback, setIsFallback] = useState(false);

  // Scheduler-specific states
  const [mockCompany, setMockCompany] = useState<string>('Google');
  const [mockType, setMockType] = useState<string>('Technical Coding: Algorithms & Data Structures');
  const [mockDate, setMockDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  });
  const [mockDuration, setMockDuration] = useState<number>(60); // minutes
  const [mockNotes, setMockNotes] = useState<string>('');
  const [isSchedulingMock, setIsSchedulingMock] = useState<boolean>(false);
  const [schedulingSuccess, setSchedulingSuccess] = useState<string | null>(null);
  const [scheduledMockEvents, setScheduledMockEvents] = useState<Array<{
    company: string;
    type: string;
    dateTime: string;
    duration: number;
    gcalLink?: string;
  }>>(() => {
    const cached = localStorage.getItem('devscope_scheduled_mocks');
    return cached ? JSON.parse(cached) : [];
  });

  // Company Insight modal states
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insightCompany, setInsightCompany] = useState('');
  const [insightContent, setInsightContent] = useState('');
  const [insightSources, setInsightSources] = useState<SearchSource[]>([]);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const handleFetchCompanyInsights = async (companyName: string) => {
    setInsightCompany(companyName);
    setIsInsightOpen(true);
    setIsInsightLoading(true);
    setInsightError(null);
    setInsightContent('');
    setInsightSources([]);

    try {
      const response = await fetch('/api/jobs/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName })
      });

      if (!response.ok) {
        throw new Error(`Failed to load insights: ${response.statusText}`);
      }

      const data = await response.json();
      setInsightContent(data.insight || '');
      setInsightSources(data.sources || []);
    } catch (err: any) {
      console.error('Error loading company insights:', err);
      setInsightError(err.message || 'An error occurred while fetching company insights.');
    } finally {
      setIsInsightLoading(false);
    }
  };

  // Restore search results from cache if present
  useEffect(() => {
    const cachedJobs = localStorage.getItem('devscope_cached_jobs');
    const cachedSources = localStorage.getItem('devscope_cached_job_sources');
    const cachedParams = localStorage.getItem('devscope_cached_job_params');
    const cachedFallback = localStorage.getItem('devscope_cached_job_fallback');
    
    if (cachedJobs && cachedSources) {
      try {
        setJobs(JSON.parse(cachedJobs));
        setSources(JSON.parse(cachedSources));
        if (cachedFallback) setIsFallback(JSON.parse(cachedFallback));
        if (cachedParams) {
          const params = JSON.parse(cachedParams);
          if (params.role) setRole(params.role);
          if (params.experienceLevel) setExperienceLevel(params.experienceLevel);
          if (params.selectedCompanies) setSelectedCompanies(params.selectedCompanies);
        }
      } catch (e) {
        console.error('Error parsing cached jobs data', e);
      }
    }
  }, []);

  // Update notes suggestion dynamically based on selected company & track
  useEffect(() => {
    const timeline = COMPANY_TIMELINES[mockCompany as keyof typeof COMPANY_TIMELINES];
    if (timeline) {
      const notes = `Mock interview focusing on: ${mockType}.

Typical ${mockCompany} Focus Areas:
- ${timeline.focusAreas.join('\n- ')}

Company-specific structure guidelines:
${timeline.process.map(p => `• ${p}`).join('\n')}

Mock checklist:
- Think out loud & communicate core trade-offs clearly.
- State time and space complexity before starting code.
- Write robust tests & identify border/edge cases.`;
      setMockNotes(notes);
    } else {
      setMockNotes(`Mock interview focusing on ${mockType}.\n\nReview common algorithms, core systems architecture, and behavioral questions related to this target track.`);
    }
  }, [mockCompany, mockType]);

  const handleToggleCompany = (company: string) => {
    setSelectedCompanies(prev => 
      prev.includes(company) 
        ? prev.filter(c => c !== company) 
        : [...prev, company]
    );
  };

  const handleAddCustomCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCompany = customCompany.trim();
    if (cleanCompany && !selectedCompanies.includes(cleanCompany)) {
      setSelectedCompanies(prev => [...prev, cleanCompany]);
      setCustomCompany('');
    }
  };

  const handleSearchJobs = async () => {
    if (selectedCompanies.length === 0) {
      setError('Please select or add at least one company to target.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: selectedCompanies,
          role,
          experienceLevel
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const foundJobs = data.jobs || [];
      const foundSources = data.sources || [];
      const fallbackMode = !!data.isFallback;

      setJobs(foundJobs);
      setSources(foundSources);
      setIsFallback(fallbackMode);

      // Cache results
      localStorage.setItem('devscope_cached_jobs', JSON.stringify(foundJobs));
      localStorage.setItem('devscope_cached_job_sources', JSON.stringify(foundSources));
      localStorage.setItem('devscope_cached_job_fallback', JSON.stringify(fallbackMode));
      localStorage.setItem('devscope_cached_job_params', JSON.stringify({
        role,
        experienceLevel,
        selectedCompanies
      }));

      if (foundJobs.length === 0) {
        setError('No recent jobs found matching your criteria. Try adjusting your target companies, role, or experience level.');
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'An error occurred while searching for job opportunities.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePrep = (job: Job) => {
    if (!onScheduleTaskOnCalendar) return;
    
    const taskName = `Prepare for ${job.title} interview at ${job.company}`;
    onScheduleTaskOnCalendar(taskName);
    
    setScheduledJobs(prev => ({
      ...prev,
      [`${job.company}-${job.title}`]: true
    }));
  };

  const handleScheduleMockInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSchedulingMock(true);
    setSchedulingSuccess(null);
    setError(null);

    const timeline = COMPANY_TIMELINES[mockCompany as keyof typeof COMPANY_TIMELINES];
    const peakSeasonText = timeline ? `Peak Recruitment Season: ${timeline.peakSeason}` : '';

    const summary = `[Mock Session] ${mockCompany} - ${mockType}`;
    const description = `${mockNotes}\n\nGenerated automatically via DevScope Prep Dashboard.\n${peakSeasonText}`;
    
    const startObj = new Date(mockDate);
    const endObj = new Date(startObj.getTime() + mockDuration * 60 * 1000);

    if (!accessToken) {
      // Offline simulation fallback
      setTimeout(() => {
        const newMock = {
          company: mockCompany,
          type: mockType,
          dateTime: startObj.toLocaleString(),
          duration: mockDuration,
        };
        const updated = [newMock, ...scheduledMockEvents];
        setScheduledMockEvents(updated);
        localStorage.setItem('devscope_scheduled_mocks', JSON.stringify(updated));
        
        setIsSchedulingMock(false);
        setSchedulingSuccess(`Mock Interview scheduled locally for ${mockCompany}! Connect Google Workspace in the Workspace tab to sync to your actual Calendar.`);
      }, 800);
      return;
    }

    try {
      const gcalEvent = await scheduleCalendarEvent(
        accessToken,
        summary,
        description,
        startObj.toISOString(),
        endObj.toISOString()
      );

      const newMock = {
        company: mockCompany,
        type: mockType,
        dateTime: startObj.toLocaleString(),
        duration: mockDuration,
        gcalLink: gcalEvent.htmlLink
      };

      const updated = [newMock, ...scheduledMockEvents];
      setScheduledMockEvents(updated);
      localStorage.setItem('devscope_scheduled_mocks', JSON.stringify(updated));
      
      setSchedulingSuccess(`"${summary}" is successfully scheduled and synced onto your Google Calendar!`);
    } catch (err: any) {
      console.error('Failed to schedule mock interview:', err);
      setError(err.message || 'Failed to schedule event. Please ensure your Google Workspace credentials are active.');
    } finally {
      setIsSchedulingMock(false);
    }
  };

  const selectedTimeline = COMPANY_TIMELINES[mockCompany as keyof typeof COMPANY_TIMELINES];

  return (
    <div className="space-y-6" id="job-opportunities-panel">
      
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <span>Placement Career & Recruitment Engine</span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" />
                  Smart Integration
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                Seamlessly pivot between real-time job listings search and corporate timeline-guided mock interview scheduling. Direct sync with Google Workspace Calendar.
              </p>
            </div>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto border border-gray-200">
            <button
              onClick={() => {
                setActiveSubTab('listings');
                setSchedulingSuccess(null);
                setError(null);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-sans transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'listings'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Job Openings</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('scheduler');
                setSchedulingSuccess(null);
                setError(null);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-sans transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'scheduler'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Mock Scheduler</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Sandbox Mode Warning */}
      {isFallback && activeSubTab === 'listings' && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-sans text-xs font-bold text-amber-800 uppercase tracking-wider">
              API Sandbox Mode Enabled
            </h4>
            <p className="text-xs text-amber-700 font-sans leading-relaxed">
              The application's global AI/Google Search Grounding quota has been temporarily depleted. To keep your job pipeline perfectly functional, we have activated Sandbox Mode. This generates direct verified links to the targeted company's official career hubs below.
            </p>
          </div>
        </div>
      )}

      {/* VIEW A: JOB LISTINGS */}
      {activeSubTab === 'listings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left filters layout */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Filter className="w-4 h-4 text-gray-400" />
              <h4 className="font-sans text-xs font-bold text-gray-700 uppercase tracking-wider">
                Search Filters & Criteria
              </h4>
            </div>

            {/* Companies Multi-Select */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 font-sans">
                Target Companies
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-lg no-scrollbar">
                {AVAILABLE_COMPANIES.map(company => {
                  const isSelected = selectedCompanies.includes(company);
                  return (
                    <button
                      key={company}
                      type="button"
                      onClick={() => handleToggleCompany(company)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium font-sans cursor-pointer transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{company}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Custom company form */}
              <form onSubmit={handleAddCustomCompany} className="flex gap-1.5 mt-2">
                <input
                  type="text"
                  placeholder="Add other company..."
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700"
                />
                <button
                  type="submit"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Job Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 font-sans">
                Target Role Category
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-gray-700 font-sans cursor-pointer"
              >
                <option value="Software Engineer">Software Engineer (Generalist)</option>
                <option value="Backend Developer">Backend Engineer</option>
                <option value="Frontend Developer">Frontend Engineer</option>
                <option value="Full Stack Developer">Full Stack Engineer</option>
                <option value="AI/ML Engineer">AI / Machine Learning Engineer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="DevOps Engineer">DevOps & Cloud Engineer</option>
              </select>
            </div>

            {/* Experience Level Choice */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 font-sans">
                Experience Target
              </label>
              <div className="grid grid-cols-1 gap-1">
                {[
                  'Internship',
                  'Internship / Entry Level',
                  'Entry Level / Associate',
                  'Junior Developer'
                ].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`text-left text-xs px-3 py-2 rounded-lg font-sans transition cursor-pointer border ${
                      experienceLevel === lvl
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Search-Grounded Company Insights Trigger */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 font-sans flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Target Company Insights</span>
              </label>
              <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                Click any company to fetch real-time assessment patterns and interview insights with Google Search.
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {selectedCompanies.map(company => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => handleFetchCompanyInsights(company)}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-indigo-500 hover:text-indigo-600 font-sans transition cursor-pointer flex items-center justify-between group"
                  >
                    <span className="truncate font-semibold text-gray-700 group-hover:text-indigo-600">{company}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
              {selectedCompanies.length === 0 && (
                <p className="text-[10px] text-amber-600 font-sans italic">Select target companies above to view insights.</p>
              )}
            </div>

            {/* Sourcing Launch Button */}
            <button
              type="button"
              onClick={handleSearchJobs}
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider font-sans"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Grounded Sourcing...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Source Opportunities</span>
                </>
              )}
            </button>
          </div>

          {/* Right postings list */}
          <div className="lg:col-span-2 space-y-4">
            
            {isLoading && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <div className="relative flex items-center justify-center">
                  <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-400 opacity-20"></div>
                  <div className="relative rounded-full bg-indigo-50 p-4 text-indigo-600">
                    <Briefcase className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-sans text-sm font-semibold text-gray-800">
                    Analyzing Live Job Boards
                  </h4>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    Executing real-time corporate directories crawl utilizing Gemini with web search grounding. Retrieving validated listings matching your placement goals.
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest font-mono animate-pulse">
                  Querying Google Search ...
                </div>
              </div>
            )}

            {!isLoading && jobs.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <div className="rounded-full bg-gray-50 p-4 text-gray-400">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="font-sans text-sm font-semibold text-gray-800">
                    Ready to Source Active Jobs
                  </h4>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed">
                    Configure your target companies and role details, then hit <strong>"Source Opportunities"</strong>. Gemini will use active Google Search grounding to retrieve real postings.
                  </p>
                </div>
                {error && (
                  <div className="max-w-md p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-sans flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {!isLoading && jobs.length > 0 && (
              <div className="space-y-4">
                
                {/* Header stats bar */}
                <div className="flex items-center justify-between px-2">
                  <div className="text-xs text-gray-500 font-sans font-medium">
                    Found <span className="text-indigo-600 font-bold">{jobs.length}</span> active placement postings
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans">
                    Grounded search result
                  </div>
                </div>

                {/* Jobs List */}
                <div className="space-y-3.5">
                  {jobs.map((job, index) => {
                    const scheduleKey = `${job.company}-${job.title}`;
                    const isScheduled = scheduledJobs[scheduleKey];
                    
                    return (
                      <div 
                        key={index} 
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                      >
                        <div className="space-y-2.5">
                          {/* Company & Title block */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 font-semibold px-2 py-0.5 rounded-full text-gray-600 uppercase tracking-wide">
                                <Building className="w-3 h-3 text-gray-400" />
                                {job.company}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-sans">
                                <Clock className="w-2.5 h-2.5" />
                                {job.postedDate || 'Recent'}
                              </span>
                            </div>
                            
                            <h4 className="font-sans text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition">
                              {job.title}
                            </h4>
                            
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span>{job.location || 'Flexible / Remote'}</span>
                            </div>
                          </div>

                          {/* Requirements tag pills */}
                          <div className="flex flex-wrap gap-1.5">
                            {job.requirements && job.requirements.map((req, i) => (
                              <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50/70 text-indigo-600 font-sans">
                                {req}
                              </span>
                            ))}
                          </div>

                          {/* Sourced via details */}
                          {job.source && (
                            <div className="text-[10px] font-sans text-gray-400 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>Sourced via: {job.source}</span>
                            </div>
                          )}
                        </div>

                        {/* Call to action buttons */}
                        <div className="flex flex-col sm:items-end justify-between gap-3 sm:text-right min-w-[120px] self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                          <a
                            href={job.url}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-sans transition cursor-pointer flex items-center justify-center gap-1 shadow-sm flex-shrink-0"
                          >
                            <span>Apply Direct</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {onScheduleTaskOnCalendar && (
                            <button
                              type="button"
                              disabled={isScheduled}
                              onClick={() => handleSchedulePrep(job)}
                              className={`w-full text-center py-1 rounded text-[10px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                                isScheduled 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100'
                              }`}
                            >
                              {isScheduled ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                                  <span>Study Block Set</span>
                                </>
                              ) : (
                                <>
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span>Schedule Prep</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grounded Citations Panel */}
                {sources && sources.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      <h5 className="font-sans text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Grounded Search Sources
                      </h5>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                      The real-time openings displayed above were extracted from the following verified search results index index. Feel free to explore the raw sources:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5">
                      {sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="p-2 border border-gray-200/60 rounded bg-white hover:border-indigo-200 transition flex items-center justify-between text-left group cursor-pointer"
                        >
                          <div className="truncate pr-4">
                            <div className="text-[11px] font-bold text-gray-700 truncate group-hover:text-indigo-600 transition">
                              {src.title}
                            </div>
                            <div className="text-[9px] text-gray-400 truncate">
                              {src.uri}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW B: MOCK INTERVIEW SCHEDULER */}
      {activeSubTab === 'scheduler' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Schedule Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <h4 className="font-sans text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mock Scheduler Settings
              </h4>
            </div>

            <form onSubmit={handleScheduleMockInterview} className="space-y-4">
              
              {/* Target Company */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 font-sans">
                  Target Company
                </label>
                <select
                  value={mockCompany}
                  onChange={(e) => setMockCompany(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-gray-700 font-sans cursor-pointer"
                >
                  {AVAILABLE_COMPANIES.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleFetchCompanyInsights(mockCompany)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer transition"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>View {mockCompany} Search Insights</span>
                  </button>
                </div>
              </div>

              {/* Interview Track / Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 font-sans">
                  Interview Focus Track
                </label>
                <select
                  value={mockType}
                  onChange={(e) => setMockType(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-gray-700 font-sans cursor-pointer"
                >
                  <option value="Technical Coding: Algorithms & Data Structures">Technical Coding: Algorithms & Data Structures</option>
                  <option value="System Design & Distributed Systems Scalability">System Design & Distributed Systems Scalability</option>
                  <option value="Behavioral & Leadership Principles Review">Behavioral & Leadership Principles Review</option>
                  <option value="Full Onsite Simulation Round (Integrated)">Full Onsite Simulation Round (Integrated)</option>
                  <option value="Object Oriented Analysis & Product Architecture">Object Oriented Analysis & Product Architecture</option>
                </select>
              </div>

              {/* Date & Time Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 font-sans">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={mockDate}
                  onChange={(e) => setMockDate(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 font-sans cursor-pointer"
                  required
                />
              </div>

              {/* Duration Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                  <span className="font-sans">Session Duration</span>
                  <span className="text-indigo-600 font-mono font-bold">{mockDuration} minutes</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={mockDuration}
                  onChange={(e) => setMockDuration(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Prep Notes Preview */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 font-sans">
                  Auto-Generated Syllabus & Prep Notes
                </label>
                <textarea
                  value={mockNotes}
                  onChange={(e) => setMockNotes(e.target.value)}
                  rows={6}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 font-mono leading-relaxed bg-gray-50 resize-y"
                  placeholder="Custom preparation checklist notes..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSchedulingMock}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider font-sans"
              >
                {isSchedulingMock ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Scheduling Session...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck2 className="w-4 h-4" />
                    <span>Schedule onto Google Calendar</span>
                  </>
                )}
              </button>
            </form>

            {/* Local Sync Notification Warning if not authenticated */}
            {!accessToken && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-[11px] font-sans flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>
                  <strong>Tip:</strong> Authenticate Google Workspace in the rightmost tab to automatically push these customized mock interview tracks directly into your live Google Calendar with complete syllabus notes!
                </span>
              </div>
            )}
          </div>

          {/* Right panel: Timeline Information and Scheduled sessions log */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Success and Error notifications */}
            {schedulingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider">
                    Success: Session Scheduled
                  </h4>
                  <p className="text-xs font-sans leading-relaxed">
                    {schedulingSuccess}
                  </p>
                  {scheduledMockEvents[0]?.gcalLink && (
                    <a
                      href={scheduledMockEvents[0].gcalLink}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold font-sans mt-1.5 hover:underline"
                    >
                      <span>Open in Google Calendar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider">
                    Scheduling Error
                  </h4>
                  <p className="text-xs font-sans leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Selected Company Timeline Sourcing Info Card */}
            {selectedTimeline && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                      <Building className="w-4 h-4" />
                    </span>
                    <h4 className="font-sans text-sm font-bold text-gray-800">
                      {mockCompany} Common Hiring Timeline
                    </h4>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded font-sans uppercase tracking-wider">
                    Timeline Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                      Peak Recruitment Season
                    </span>
                    <span className="block text-xs font-bold text-indigo-700 font-sans leading-normal">
                      {selectedTimeline.peakSeason}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                      Recommended Practice Cycle
                    </span>
                    <span className="block text-xs font-bold text-gray-700 font-sans">
                      {selectedTimeline.recommendedPrepDays} Days Intensive Study
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-gray-50">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    Process Sequence Map
                  </span>
                  <div className="space-y-2">
                    {selectedTimeline.process.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs text-gray-600 leading-relaxed font-sans items-start">
                        <span className="text-indigo-500 font-bold mt-0.5 flex-shrink-0">#{idx+1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-gray-50">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
                    High Probability Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTimeline.focusAreas.map((topic, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-sans flex items-center gap-1 border border-indigo-100">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span>{topic}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 leading-relaxed font-sans border border-gray-100 italic">
                  &ldquo;{selectedTimeline.description}&rdquo;
                </div>
              </div>
            )}

            {/* Historical list of Scheduled Mock Sessions */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                    <Video className="w-4 h-4" />
                  </span>
                  <h4 className="font-sans text-sm font-bold text-gray-800">
                    Your Scheduled Mock Sprints ({scheduledMockEvents.length})
                  </h4>
                </div>
                {scheduledMockEvents.length > 0 && (
                  <button
                    onClick={() => {
                      setScheduledMockEvents([]);
                      localStorage.removeItem('devscope_scheduled_mocks');
                    }}
                    className="text-[10px] text-gray-400 hover:text-rose-500 font-sans font-bold cursor-pointer uppercase tracking-wider"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {scheduledMockEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 font-sans">
                  No mock sessions scheduled yet. Use the scheduler panel on the left to set up your target focus milestones.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                  {scheduledMockEvents.map((mock, index) => (
                    <div key={index} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 font-sans">
                            {mock.company}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-medium">
                            {mock.duration}m track
                          </span>
                        </div>
                        <span className="block text-xs text-gray-500 font-sans font-medium">
                          {mock.type}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans">
                          <Clock className="w-3 h-3 text-gray-300" />
                          <span>{mock.dateTime}</span>
                        </div>
                      </div>

                      {mock.gcalLink && (
                        <a
                          href={mock.gcalLink}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded text-[10px] font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <span>Calendar</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Search-Grounded Company Insight Modal */}
      {isInsightOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="company-insight-modal-overlay">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsInsightOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100 flex flex-col max-h-[85vh]">
              
              {/* Modal Header */}
              <div className="bg-indigo-900 px-6 py-5 text-white relative flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-800/80 rounded-lg">
                    <Building className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-indigo-200 uppercase tracking-widest font-mono">
                      Google Search Grounded Analysis
                    </span>
                    <h3 className="text-lg font-bold font-sans">
                      {insightCompany} Assessment Insights
                    </h3>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsInsightOpen(false)}
                  className="rounded-lg p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-800 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {isInsightLoading && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-400 opacity-20"></div>
                      <div className="relative rounded-full bg-indigo-50 p-4 text-indigo-600">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-sans text-sm font-semibold text-gray-800">
                        Retrieving Company Intelligence
                      </h4>
                      <p className="text-xs text-gray-500 font-sans max-w-sm leading-relaxed">
                        Querying real-time recruiter forums and verified interview databases for {insightCompany} software engineering assessment patterns...
                      </p>
                    </div>
                    <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest font-mono animate-pulse pt-1">
                      Running Grounded Search Query...
                    </div>
                  </div>
                )}

                {insightError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-sans flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold">Failed to load insights</h5>
                      <p className="leading-relaxed">{insightError}</p>
                    </div>
                  </div>
                )}

                {!isInsightLoading && !insightError && (
                  <div className="space-y-6">
                    {/* Main Rendered Insight Text */}
                    <div className="prose max-w-none">
                      <MarkdownRenderer content={insightContent} />
                    </div>

                    {/* Grounded Citations Panel */}
                    {insightSources && insightSources.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 pt-3">
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                          <h5 className="font-sans text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Grounded Search Citations
                          </h5>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal font-sans">
                          These insights were synthesized from the following real-time references:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          {insightSources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.uri}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="p-2 border border-gray-200 bg-white hover:border-indigo-300 rounded-lg flex items-center justify-between text-left group cursor-pointer transition"
                            >
                              <div className="truncate pr-3">
                                <div className="text-[11px] font-bold text-gray-700 truncate group-hover:text-indigo-600 transition">
                                  {src.title}
                                </div>
                                <div className="text-[9px] text-gray-400 truncate">
                                  {src.uri}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2.5 rounded-b-2xl border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsInsightOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold font-sans transition cursor-pointer"
                >
                  Close Insights
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Custom Markdown renderer for company insight content
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-3 font-sans text-gray-700 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-sans text-xs font-bold text-indigo-900 uppercase tracking-wider mt-5 mb-2 first:mt-0 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <span>{trimmed.substring(4)}</span>
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-sans text-sm font-bold text-gray-900 mt-5 mb-2.5 first:mt-0 border-b border-gray-100 pb-1.5">
              <span>{trimmed.substring(3)}</span>
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-sans text-base font-bold text-gray-900 mt-6 mb-3 first:mt-0">
              <span>{trimmed.substring(2)}</span>
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const rawText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 ml-2 pl-0.5 my-1 text-xs text-gray-600">
              <span className="text-indigo-500 font-bold mt-0.5 text-sm">•</span>
              <span className="flex-1">{renderInlineStyles(rawText)}</span>
            </div>
          );
        }

        // Horizontal Rule
        if (trimmed === '---') {
          return <hr key={idx} className="my-4 border-gray-150" />;
        }

        // Empty lines
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-xs text-gray-600 font-sans leading-relaxed my-1">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Simple parser for inline elements like **bold** and [text](link)
function renderInlineStyles(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentKey = 0;

  let i = 0;
  while (i < text.length) {
    // Check for bold **
    if (text.startsWith('**', i)) {
      const closeIdx = text.indexOf('**', i + 2);
      if (closeIdx !== -1) {
        parts.push(
          <strong key={currentKey++} className="font-bold text-gray-900">
            {text.substring(i + 2, closeIdx)}
          </strong>
        );
        i = closeIdx + 2;
        continue;
      }
    }

    // Check for links [text](url)
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i);
      if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket + 2);
        if (closeParen !== -1) {
          const linkText = text.substring(i + 1, closeBracket);
          const linkUrl = text.substring(closeBracket + 2, closeParen);
          parts.push(
            <a
              key={currentKey++}
              href={linkUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span>{linkText}</span>
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          );
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Normal character
    parts.push(text[i]);
    i++;
  }

  return parts;
}
