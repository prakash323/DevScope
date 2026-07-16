/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Play, 
  Sparkles, 
  AlertTriangle,
  ChevronRight,
  Info,
  CheckSquare
} from 'lucide-react';
import { RoadmapItem, CareerRole } from '../types';

interface RoadmapPanelProps {
  roadmap: RoadmapItem[] | null;
  onGenerate: (role: CareerRole) => Promise<void>;
  onToggleTask: (weekNum: number, taskId: string) => void;
  onUpdateTaskPriority?: (weekNum: number, taskId: string, priority: 'High' | 'Medium' | 'Low') => void;
  hasProfile: boolean;
  onScheduleTaskOnCalendar?: (taskName: string) => void;
  onSyncAllToGoogleTasks?: () => Promise<void>;
  isGoogleConnected?: boolean;
}

export default function RoadmapPanel({ 
  roadmap, 
  onGenerate, 
  onToggleTask, 
  onUpdateTaskPriority,
  hasProfile, 
  onScheduleTaskOnCalendar,
  onSyncAllToGoogleTasks,
  isGoogleConnected
}: RoadmapPanelProps) {
  const [selectedRole, setSelectedRole] = useState<CareerRole>('Backend');
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'priority'>('default');

  const handleGenerateRoadmap = async () => {
    setIsLoading(true);
    try {
      await onGenerate(selectedRole);
      setActiveWeek(1);
    } finally {
      setIsLoading(false);
    }
  };

  const currentWeekDetails = roadmap?.find(w => w.week === activeWeek);

  // Compute overall roadmap task completion %
  const totalTasks = roadmap?.reduce((sum, w) => sum + w.tasks.length, 0) || 0;
  const completedTasks = roadmap?.reduce((sum, w) => sum + w.tasks.filter(t => t.completed).length, 0) || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityWeight: Record<'High' | 'Medium' | 'Low', number> = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  const getPriorityWeight = (priority?: 'High' | 'Medium' | 'Low') => {
    if (!priority) return 2; // Default to Medium
    return priorityWeight[priority];
  };

  const displayedTasks = (() => {
    if (!currentWeekDetails) return [];
    const tasksCopy = [...currentWeekDetails.tasks];
    if (sortBy === 'priority') {
      return tasksCopy.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
    }
    return tasksCopy;
  })();

  return (
    <div className="space-y-6" id="roadmap-panel">
      
      {/* Generate Panel Trigger */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-sans text-base font-semibold text-gray-900 mb-1">
          AI-Powered Learning Roadmap Engine
        </h3>
        <p className="text-xs text-gray-500 font-sans mb-4">
          Generates a structured, week-by-week curriculum specifically designed to bridge the gaps found in your resume validation and code reviews.
        </p>

        {hasProfile ? (
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as CareerRole)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white font-sans text-gray-700"
            >
              <option value="Backend">Backend Engineering Focus</option>
              <option value="Frontend">Frontend Engineering Focus</option>
              <option value="Full Stack">Full Stack Generalist Focus</option>
              <option value="AI/ML">Artificial Intelligence / ML Focus</option>
            </select>

            <button
              onClick={handleGenerateRoadmap}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Assembling Curricula...' : 'Generate Weekly Roadmap'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-sans max-w-md">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Connect your profile first to customize this learning curriculum.</span>
          </div>
        )}
      </div>

      {roadmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Timeline week nav buttons */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Progress Bar overall */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm font-sans">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overall Prep Completion</h4>
              <div className="text-2xl font-bold text-gray-900 mb-2">{completionPercentage}%</div>
              
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: `${completionPercentage}%` }} />
              </div>
              <div className="text-[10px] text-gray-400 mt-1.5">{completedTasks} of {totalTasks} tasks completed</div>
            </div>

            {/* Weeks Selector Navigation */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm font-sans space-y-1">
              {roadmap.map((w) => {
                const weekTasksCompleted = w.tasks.filter(t => t.completed).length;
                const isWeekDone = weekTasksCompleted === w.tasks.length;
                return (
                  <button
                    key={w.week}
                    onClick={() => setActiveWeek(w.week)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex justify-between items-center transition ${
                      activeWeek === w.week 
                        ? 'bg-indigo-50 text-indigo-900 font-semibold' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${activeWeek === w.week ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span>Week {w.week}: {w.title.slice(0, 16)}...</span>
                    </div>
                    {isWeekDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            {/* Google Tasks Sync Controller */}
            {onSyncAllToGoogleTasks && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm font-sans space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Google Tasks Sync</h4>
                    <p className="text-[10px] text-gray-400">Study plan task manager</p>
                  </div>
                </div>

                {isGoogleConnected ? (
                  <button
                    onClick={onSyncAllToGoogleTasks}
                    className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sync Entire Plan</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-700 font-medium">
                    Connect Google Workspace to enable task list syncing.
                  </div>
                )}
                
                <p className="text-[9px] text-gray-400 leading-normal text-center">
                  Individual tasks auto-sync on checking or priority updates.
                </p>
              </div>
            )}

          </div>

          {/* Active Week Display */}
          {currentWeekDetails && (
            <div className="lg:col-span-3 space-y-6 font-sans">
              
              {/* Theme Summary header */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    WEEK {currentWeekDetails.week} STUDY MODULE
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Est: {currentWeekDetails.estimatedHours} study hours</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {currentWeekDetails.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {currentWeekDetails.focus}
                </p>
              </div>

              {/* Interactive task checklist */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Curricular Checklist & Study Gaps Tasks
                  </h4>
                  
                  <div className="flex items-center gap-2">
                    <label htmlFor="task-priority-sort" className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Sort:</label>
                    <select
                      id="task-priority-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'default' | 'priority')}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans cursor-pointer font-medium"
                    >
                      <option value="default">Weekly Order</option>
                      <option value="priority">Priority (High → Low)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {displayedTasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => onToggleTask(activeWeek, task.id)}
                      className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50/50 transition cursor-pointer select-none group"
                    >
                      <div className="flex items-start gap-3 flex-1 mr-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}} // Controlled by outer div click to prevent input conflict
                          className="w-4 h-4 mt-0.5 accent-indigo-600 cursor-pointer text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                        />
                        <span className={`text-xs ${
                          task.completed ? 'line-through text-gray-400 font-normal' : 'text-gray-700 font-medium'
                        }`}>
                          {task.task}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          id={`priority-select-${task.id}`}
                          value={task.priority || 'Medium'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (onUpdateTaskPriority) {
                              onUpdateTaskPriority(activeWeek, task.id, e.target.value as 'High' | 'Medium' | 'Low');
                            }
                          }}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition ${
                            task.priority === 'High' 
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                              : task.priority === 'Low'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <option value="High" className="text-gray-700">High</option>
                          <option value="Medium" className="text-gray-700">Medium</option>
                          <option value="Low" className="text-gray-700">Low</option>
                        </select>

                        {onScheduleTaskOnCalendar && !task.completed && (
                          <button
                            id={`schedule-btn-${task.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleTaskOnCalendar(task.task);
                            }}
                            className="hidden group-hover:flex items-center gap-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-2 py-1 rounded transition"
                            title="Schedule this preparation block on Google Calendar"
                          >
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            <span>Schedule</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended resources */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Curated Practice Guides
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentWeekDetails.resources.map((res, idx) => (
                    <div 
                      key={idx}
                      className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-medium text-gray-700">{res}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-sans font-semibold text-gray-800 text-lg">No Learning Roadmap Active</h4>
          <p className="text-sm text-gray-400 font-sans mt-1 max-w-sm mx-auto">
            Select a target preparation role and click generate above to compile your personalized 8-week structured study roadmap.
          </p>
        </div>
      )}

    </div>
  );
}
