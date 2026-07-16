/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Module A - Authentication & Profile Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Module C - GitHub Types
export interface GitHubRepository {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  hasReadme: boolean;
  readmeScore: number; // 0 to 15
  documentationScore: number; // 0 to 10
  commitFrequencyScore: number; // 0 to 20
  branchUsageScore: number; // 0 to 10
  testingScore: number; // 0 to 10
  ciCdScore: number; // 0 to 10
  projectDiversityScore: number; // 0 to 15
  architectureScore: number; // 0 to 5
  communityScore: number; // 0 to 5
  overallScore: number; // 0 to 100 (weighted sum)
  updatedAt: string;
}

export interface GitHubProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  repositories: GitHubRepository[];
  overallGitHubScore: number; // 0 to 100
  lastAnalyzedAt: string;
}

// Module B - LeetCode Types
export interface LeetCodeProfile {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  acceptanceRate: number;
  overallLeetCodeScore: number; // 0 to 100
  recentSubmissions: {
    title: string;
    language: string;
    status: string;
    time: string;
  }[];
}

// Module D & E - Resume Types
export interface ResumeData {
  fileName: string;
  skills: string[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  certifications: string[];
  atsScore: number; // 0 to 100
  suggestions: string[];
}

export interface SkillValidation {
  skill: string;
  level: 'Expert' | 'Intermediate' | 'Beginner' | 'Not Found';
  githubEvidence: boolean;
  leetcodeEvidence?: boolean;
  leetcodeSolvedCount?: number;
  matchingRepos: string[];
  status: 'Verified' | 'Unverified' | 'Partial';
  remedialProject?: {
    title: string;
    description: string;
    recommendedStack: string[];
  };
}

// Module F - Role Readiness
export type CareerRole = 'Backend' | 'Frontend' | 'Full Stack' | 'AI/ML';

export interface RoleReadiness {
  role: CareerRole;
  readinessScore: number; // 0 to 100
  strengths: string[];
  weaknesses: string[];
  missingTech: string[];
  improvementPlan: string[];
}

// Module G - Company Readiness
export type TargetCompany = 'Google' | 'Amazon' | 'Microsoft' | 'Meta' | 'Apple' | 'Adobe' | 'Oracle' | 'Atlassian';

export interface CompanyReadiness {
  company: TargetCompany;
  isReady: boolean;
  readinessScore: number; // 0 to 100
  rubricScores: {
    dsaWeight: number; // LeetCode relation
    projectWeight: number; // GitHub relation
    systemDesignWeight: number; // Experience/Architecture relation
    resumeWeight: number; // ATS/Sourcing relation
  };
  explanation: string;
}

// Module H - Roadmap Types
export interface RoadmapItem {
  week: number;
  title: string;
  focus: string;
  tasks: {
    id: string;
    task: string;
    completed: boolean;
  }[];
  estimatedHours: number;
  resources: string[];
}

// Activity Log
export interface ActivityLog {
  id: string;
  action: string;
  module: 'AUTH' | 'GITHUB' | 'LEETCODE' | 'RESUME' | 'ROADMAP' | 'SYSTEM';
  timestamp: string;
  details?: string;
}

// Complete Dashboard State
export interface DevScopeState {
  user: User | null;
  github: GitHubProfile | null;
  leetcode: LeetCodeProfile | null;
  resume: ResumeData | null;
  skillValidation: SkillValidation[];
  roleReadiness: RoleReadiness[];
  companyReadiness: CompanyReadiness[];
  roadmap: RoadmapItem[] | null;
  activities: ActivityLog[];
  overallScore: number; // 0 to 100
}
