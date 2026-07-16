/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Mail, 
  RefreshCw, 
  Send, 
  Plus, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FileText,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { GoogleCalendarEvent, GoogleGmailMessage, fetchUpcomingEvents, scheduleCalendarEvent, sendRecruitmentEmail, fetchRecruitmentEmails } from '../lib/workspace';

interface WorkspacePanelProps {
  accessToken: string | null;
  onConnectGoogle: () => Promise<void>;
  skills: string[];
  overallScore: number;
}

export default function WorkspacePanel({ accessToken, onConnectGoogle, skills, overallScore }: WorkspacePanelProps) {
  // Calendar States
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  
  // Gmail States
  const [emails, setEmails] = useState<GoogleGmailMessage[]>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  // Scheduling Dialog Form State
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [eventSummary, setEventSummary] = useState('DevScope: DSA Trees Practise Session');
  const [eventDate, setEventDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [eventTime, setEventTime] = useState('14:00');
  const [isScheduling, setIsScheduling] = useState(false);

  // Email Sourcing Dialog Form State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('Application for Software Engineer Internship | Placement Candidate');
  const [emailBody, setEmailBody] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const loadCalendarData = async (token: string) => {
    setCalendarLoading(true);
    setCalendarError(null);
    try {
      const items = await fetchUpcomingEvents(token);
      setEvents(items);
    } catch (err: any) {
      setCalendarError(err.message || 'Error fetching calendar events.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const loadGmailData = async (token: string) => {
    setGmailLoading(true);
    setGmailError(null);
    try {
      const msgs = await fetchRecruitmentEmails(token);
      setEmails(msgs);
    } catch (err: any) {
      setGmailError(err.message || 'Error retrieving recruitment emails.');
    } finally {
      setGmailLoading(false);
    }
  };

  // Sync data automatically if we have access token
  useEffect(() => {
    if (accessToken) {
      loadCalendarData(accessToken);
      loadGmailData(accessToken);
    }
  }, [accessToken]);

  // Draft outreach email using backend Gemini route
  const handleDraftPitch = async () => {
    if (!skills.length) {
      alert('Please upload or paste your resume first so we can draft a pitch with your core skills.');
      return;
    }
    
    setIsDrafting(true);
    try {
      const res = await fetch('/api/workspace/draft-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          overallScore
        })
      });

      if (!res.ok) throw new Error('Failed to generate AI outreach pitch.');
      const data = await res.json();
      setEmailSubject(data.subject);
      setEmailBody(data.body);
    } catch (err: any) {
      console.error(err);
      setEmailBody(`Respected Recruiter,\n\nI am a Software Engineering placement candidate with an aggregate DevScope Employability score of ${overallScore}%. My technical skills include: ${skills.slice(0, 5).join(', ')}.\n\nI would love to explore internship and entry-level positions within your engineering teams.\n\nSincerely,\nPlacement Candidate`);
    } finally {
      setIsDrafting(false);
    }
  };

  // Submit calendar event creation
  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsScheduling(true);
    try {
      const startIso = `${eventDate}T${eventTime}:00`;
      // Default to 1-hour duration
      const startTimeObj = new Date(startIso);
      const endTimeObj = new Date(startTimeObj.getTime() + 60 * 60 * 1000);
      const endIso = endTimeObj.toISOString();

      await scheduleCalendarEvent(
        accessToken,
        eventSummary,
        'Auto-scheduled from your DevScope placement prep learning roadmap.',
        startTimeObj.toISOString(),
        endIso
      );

      alert('Event successfully scheduled directly onto your Google Calendar!');
      setShowScheduleForm(false);
      loadCalendarData(accessToken);
    } catch (err: any) {
      alert(`Scheduling failed: ${err.message}`);
    } finally {
      setIsScheduling(false);
    }
  };

  // Submit recruitment email send via Gmail API
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!recipientEmail) {
      alert('Please enter a recipient email.');
      return;
    }

    // Require user confirmation as per workspace integration guidelines for destructive operations
    const confirmSend = window.confirm(`Are you sure you want to send this outreach pitch email to ${recipientEmail}? This will deliver a real email via your Gmail account.`);
    if (!confirmSend) return;

    setIsSendingEmail(true);
    setEmailSentSuccess(false);
    try {
      await sendRecruitmentEmail(accessToken, recipientEmail, emailSubject, emailBody);
      setEmailSentSuccess(true);
      setRecipientEmail('');
      loadGmailData(accessToken);
      setTimeout(() => setEmailSentSuccess(false), 5000);
    } catch (err: any) {
      alert(`Email dispatch failed: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Pre-configured mock values for premium sandbox presentation
  const mockEvents = [
    { id: '1', summary: 'DevScope: Mock Placement System Design Interview', start: { dateTime: '2026-07-16T10:00:00+05:30' }, end: { dateTime: '2026-07-16T11:00:00+05:30' } },
    { id: '2', summary: 'DevScope: LeetCode Graph Recursion Practise', start: { dateTime: '2026-07-18T16:00:00+05:30' }, end: { dateTime: '2026-07-18T17:00:00+05:30' } }
  ];

  const mockEmails = [
    { id: 'm1', from: 'University Placement Cell <placements@vitap.edu>', subject: 'On-Campus Recruiting Drive Schedule', date: 'Yesterday', snippet: 'The schedules for technical assessments for upcoming on-campus placements have been finalised...' },
    { id: 'm2', from: 'Amazon Careers <no-reply@amazon.com>', subject: 'Action Required: Online Technical Evaluation Invitation', date: '2 days ago', snippet: 'Thank you for your interest. You are invited to complete our 90-minute online coding assessment...' }
  ];

  return (
    <div className="space-y-6 font-sans" id="workspace-panel">
      
      {/* Connector Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Google Workspace Career Integrations</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Authorize your placement cell profile to interact with Google Calendar and Gmail. Sync mock interview slots, draft recruiters' pitches, and track active career invites in real-time.
          </p>
        </div>
        
        {!accessToken ? (
          <button
            onClick={onConnectGoogle}
            className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Authorize Google Workspace</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Google Account Synced</span>
          </div>
        )}
      </div>

      {/* Grid of Calendar & Gmail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Google Calendar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <span>Upcoming Placement Schedules</span>
              </h3>
              {accessToken && (
                <div className="flex gap-2">
                  <button
                    onClick={() => loadCalendarData(accessToken)}
                    disabled={calendarLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                  >
                    <RefreshCw className={`w-4 h-4 ${calendarLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowScheduleForm(true)}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Block</span>
                  </button>
                </div>
              )}
            </div>

            {/* Schedule Form */}
            {showScheduleForm && (
              <form onSubmit={handleScheduleEvent} className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Schedule Study Event</h4>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Event Summary</label>
                  <input
                    type="text"
                    required
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="px-2.5 py-1.5 border border-gray-300 text-gray-600 rounded text-xs font-semibold hover:bg-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isScheduling}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition"
                  >
                    {isScheduling ? 'Scheduling...' : 'Add to Google Calendar'}
                  </button>
                </div>
              </form>
            )}

            {/* List Events */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {!accessToken ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-gray-400">Showing offline demo events. Authorize workspace to sync your real calendar schedules.</p>
                  <div className="space-y-2">
                    {mockEvents.map((evt) => (
                      <div key={evt.id} className="flex gap-3 text-left p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                        <div className="p-2 rounded bg-indigo-50 text-indigo-600 h-fit">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800">{evt.summary}</h4>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(evt.start.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : calendarLoading ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                  <span>Loading calendar schedules...</span>
                </div>
              ) : calendarError ? (
                <div className="text-center py-10 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                  <span>{calendarError}</span>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400 font-sans">
                  No upcoming calendar preparation events. Click 'Create Block' to schedule your first DSA study session.
                </div>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="flex gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition">
                    <div className="p-2.5 rounded bg-indigo-50 text-indigo-600 h-fit">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{evt.summary}</h4>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{evt.description || 'DevScope Study Block'}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50/50 border border-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {evt.start.dateTime 
                            ? new Date(evt.start.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                            : evt.start.date}
                        </span>
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-gray-400 hover:text-indigo-600 flex items-center gap-0.5 font-medium"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Gmail Outreach Sourcing */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>AI Recruiter Pitch & Tracking</span>
              </h3>
              {accessToken && (
                <button
                  onClick={() => loadGmailData(accessToken)}
                  disabled={gmailLoading}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  <RefreshCw className={`w-4 h-4 ${gmailLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Email Drafting area */}
            <div className="space-y-4 mb-6">
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                      <span>Draft AI Recruiter Outreach Email</span>
                    </h4>
                    <p className="text-[10px] text-indigo-700 mt-1">
                      Generates a high-conversion cold pitch embedding your parsed credentials and overall employability index of <strong className="text-indigo-900 font-bold">{overallScore}%</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDraftPitch}
                    disabled={isDrafting}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition"
                  >
                    <span>{isDrafting ? 'Writing...' : 'Generate Draft'}</span>
                  </button>
                </div>
              </div>

              {/* Composition Form */}
              {(emailBody || isDrafting) && (
                <form onSubmit={handleSendEmail} className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MIME Dispatch Frame</h4>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">To (Recruiter / Self)</label>
                    <input
                      type="email"
                      required
                      placeholder="recruiter@company.com or your_email@gmail.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Message</label>
                    <textarea
                      rows={5}
                      required
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-mono"
                    />
                  </div>

                  {emailSentSuccess && (
                    <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Pitch dispatched successfully! Log updated in Firestore.</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSendingEmail || !recipientEmail}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingEmail ? 'Dispatching...' : 'Send via Gmail'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Recruiter Inbox tracking */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Placement Communications Sourcing</span>
              </h4>

              <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                {!accessToken ? (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-[10px] text-gray-400">Offline simulation of active recruiter responses in your inbox:</p>
                    <div className="space-y-2 text-left">
                      {mockEmails.map((msg) => (
                        <div key={msg.id} className="p-2.5 border border-gray-100 rounded-lg bg-gray-50/50">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-semibold text-gray-700 truncate max-w-[150px]">{msg.from}</span>
                            <span className="text-[9px] text-gray-400">{msg.date}</span>
                          </div>
                          <h5 className="text-[10px] font-bold text-gray-800 mt-1 truncate">{msg.subject}</h5>
                          <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1">{msg.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : gmailLoading ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-indigo-500" />
                    <span>Searching inbox keywords...</span>
                  </div>
                ) : gmailError ? (
                  <div className="text-center py-4 text-[11px] text-red-500">
                    <span>Active inbox mapping restricted: {gmailError}</span>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400 font-sans">
                    No active interview invitation matching keywords in recent messages.
                  </div>
                ) : (
                  emails.map((msg) => (
                    <div key={msg.id} className="p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition text-left">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 truncate max-w-[180px]" title={msg.from}>{msg.from}</span>
                        <span className="text-[9px] text-gray-400 flex-shrink-0">{msg.date ? new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-gray-800 mt-1.5 truncate">{msg.subject}</h5>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{msg.snippet}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
