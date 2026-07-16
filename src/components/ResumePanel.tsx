/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Briefcase, 
  Cpu, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { ResumeData } from '../types';

interface ResumePanelProps {
  resume: ResumeData | null;
  onAnalyze: (resumeText: string, fileName?: string) => Promise<void>;
}

export default function ResumePanel({ resume, onAnalyze }: ResumePanelProps) {
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      await onAnalyze(pasteText.trim(), 'pasted_resume.txt');
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check your text.');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop uploader handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setFileName(file.name);
    // Read the file as text for scanning
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        setIsLoading(true);
        setError('');
        try {
          await onAnalyze(text, file.name);
        } catch (err: any) {
          setError(err.message || 'File analysis failed.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.onerror = () => {
      setError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" id="resume-panel">
      
      {/* File Drop & Paste Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Container */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white border-2 border-dashed rounded-xl p-8 text-center shadow-sm flex flex-col justify-center items-center transition ${
            isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200'
          }`}
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="font-sans font-semibold text-gray-800 text-sm">Drag & Drop Resume File</h4>
          <p className="text-xs text-gray-400 font-sans mt-1 max-w-xs mx-auto">
            Supports .pdf, .docx, .txt, or .md files. The platform parses structures and checks for ATS keyword layouts.
          </p>
          
          <div className="mt-4">
            <input
              type="file"
              id="resume-file-input"
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.txt,.md,.json"
            />
            <label
              htmlFor="resume-file-input"
              className="px-4 py-1.5 border border-indigo-600 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Select File</span>
            </label>
          </div>
          {fileName && (
            <div className="text-xs text-gray-600 font-sans mt-3 bg-gray-50 px-2.5 py-1 rounded">
              Loaded: {fileName}
            </div>
          )}
        </div>

        {/* Paste Container */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-sans font-semibold text-gray-800 text-sm mb-1">Directly Paste Resume Text</h4>
            <p className="text-xs text-gray-400 font-sans">
              Alternative for instant scans. Copy all text from your doc and paste it below.
            </p>
          </div>
          
          <form onSubmit={handleSubmitText} className="mt-3 space-y-3">
            <textarea
              rows={4}
              required
              placeholder="Paste professional summary, experience blocks, and skills list here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !pasteText.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Analyzing Resume Structure...' : 'Analyze Paste'}
            </button>
          </form>
        </div>

      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-sans">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resume ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Block: ATS Score & Optimization Checklist */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* ATS Metric Wheel */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-sans font-semibold text-gray-800">@{resume.fileName}</h4>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider font-sans mt-1">
                ATS OPTIMIZATION RATING
              </p>
              
              <div className="my-4">
                <span className="text-4xl font-bold tracking-tight text-gray-900 font-sans">
                  {resume.atsScore}%
                </span>
                <span className={`block text-[11px] font-sans font-semibold mt-1.5 ${
                  resume.atsScore >= 75 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {resume.atsScore >= 75 ? 'Excellent Layout' : 'Gaps Identified'}
                </span>
              </div>
            </div>

            {/* ATS Optimization suggestions checklist */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-indigo-500" />
                <span>ATS Structural Suggestions</span>
              </h4>

              <div className="space-y-3 font-sans text-xs">
                {resume.suggestions.map((sug, idx) => (
                  <div key={idx} className="flex gap-2 items-start leading-relaxed text-gray-600">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Block: Parsed Sections */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Extracted Skills badge list */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Extracted Developer Skills ({resume.skills.length})</span>
              </h4>
              
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((skill) => (
                  <span 
                    key={skill}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted Projects */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Resume Projects Extracted</span>
              </h4>

              <div className="space-y-4">
                {resume.projects.map((proj, idx) => (
                  <div key={idx} className="border border-gray-100 p-3.5 rounded-lg bg-gray-50/50">
                    <h5 className="font-sans font-semibold text-sm text-gray-800">{proj.title}</h5>
                    <p className="text-xs text-gray-500 font-sans mt-1 leading-relaxed">{proj.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.technologies.map((tech) => (
                        <span key={tech} className="bg-white px-2 py-0.5 border border-gray-200 text-gray-500 rounded text-[10px] font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Work Experience */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-sans text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>Work / Internship Experience</span>
              </h4>

              <div className="space-y-4 divide-y divide-gray-100">
                {resume.experience.map((exp, idx) => (
                  <div key={idx} className={`font-sans text-xs ${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-sm text-gray-800">{exp.role}</h5>
                        <div className="text-gray-500 font-medium">{exp.company}</div>
                      </div>
                      <div className="text-gray-400 text-[10px] font-semibold uppercase">{exp.duration}</div>
                    </div>
                    <p className="text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-sans font-semibold text-gray-800 text-lg">No Resume Scanned</h4>
          <p className="text-sm text-gray-400 font-sans mt-1 max-w-sm mx-auto">
            Drag your resume file or paste plain-text into the panels above to analyze ATS compliance and skills structure.
          </p>
        </div>
      )}

    </div>
  );
}
