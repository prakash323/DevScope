const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true, index: true },
  fullName: { type: String },
  email: { type: String },
  gitUsername: { type: String },
  leetcodeUsername: { type: String },
  overallScore: { type: Number },
  github: { type: mongoose.Schema.Types.Mixed },
  leetcode: { type: mongoose.Schema.Types.Mixed },
  resume: { type: mongoose.Schema.Types.Mixed },
  skillValidation: [mongoose.Schema.Types.Mixed],
  roleReadiness: [mongoose.Schema.Types.Mixed],
  companyReadiness: [mongoose.Schema.Types.Mixed],
  roadmap: { type: mongoose.Schema.Types.Mixed },
  activities: [mongoose.Schema.Types.Mixed],
  updatedAt: { type: String }
}, { bufferCommands: false });

// Implement a .pre('save') lifecycle hook that automatically calculates 'overallScore'
UserProfileSchema.pre('save', function(next) {
  let totalScore = 40; // Default baseline employability score
  let componentsCount = 1;

  if (this.github && this.github.overallGitHubScore) {
    totalScore += this.github.overallGitHubScore;
    componentsCount++;
  }
  if (this.leetcode && this.leetcode.overallLeetCodeScore) {
    totalScore += this.leetcode.overallLeetCodeScore;
    componentsCount++;
  }
  if (this.resume && this.resume.atsScore) {
    totalScore += this.resume.atsScore;
    componentsCount++;
  }

  this.overallScore = Math.round(totalScore / componentsCount);
  next();
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
