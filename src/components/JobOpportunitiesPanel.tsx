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
  ChevronRight
} from 'lucide-react';

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

export default function JobOpportunitiesPanel({ 
  targetCompanies, 
  preferredRole, 
  accessToken,
  onScheduleTaskOnCalendar 
}: JobOpportunitiesPanelProps) {
  // Parse target companies list or fall back to default
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

  return (
    <div className="space-y-6" id="job-opportunities-panel">
      
      {/* Header card with contextual description */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-sans text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <span>Real-time Career Openings Sourcing</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                Google Search Grounding
              </span>
            </h3>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Find live software engineering roles from your targeted elite companies. DevScope runs grounded Google searches directly against official corporate directories and validated technical job portals to construct an verified application pipeline.
            </p>
          </div>
        </div>
      </div>

      {isFallback && (
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

      {/* Configurations & Filter Dashboard */}
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

    </div>
  );
}
