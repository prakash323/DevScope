const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const UserProfile = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for cross-origin requests from the React frontend running on localhost
app.use(cors());

// Configure express.json with limit to safely parse large resume texts
app.use(express.json({ limit: '10mb' }));

// Set buffer commands false globally
mongoose.set('bufferCommands', false);

// Connect to the local MongoDB database with fast failover configuration
const mongoURI = 'mongodb://localhost:27017/';
mongoose.connect(mongoURI, {
  dbName: 'devscope',
  serverSelectionTimeoutMS: 2000
})
  .then(() => {
    console.log('Successfully connected to MongoDB instance at devscope database');
  })
  .catch((err) => {
    console.warn('Failed to connect to MongoDB. Gracefully falling back to secure local filesystem database.');
  });

// Local filesystem fallback storage helper
const LOCAL_DB_DIR = path.join(process.cwd(), 'data_fallback');
if (!fs.existsSync(LOCAL_DB_DIR)) {
  fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
}

function getLocalProfilePath(uid) {
  return path.join(LOCAL_DB_DIR, `profile_${uid}.json`);
}

function saveProfileFallback(uid, profileData) {
  const filePath = getLocalProfilePath(uid);
  let existing = {};
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      existing = {};
    }
  }
  
  const updatedAt = new Date().toISOString();
  const merged = { ...existing, ...profileData, uid, updatedAt };
  
  let totalScore = 40;
  let componentsCount = 1;
  if (merged.github && merged.github.overallGitHubScore) {
    totalScore += merged.github.overallGitHubScore;
    componentsCount++;
  }
  if (merged.leetcode && merged.leetcode.overallLeetCodeScore) {
    totalScore += merged.leetcode.overallLeetCodeScore;
    componentsCount++;
  }
  if (merged.resume && merged.resume.atsScore) {
    totalScore += merged.resume.atsScore;
    componentsCount++;
  }
  merged.overallScore = Math.round(totalScore / componentsCount);
  
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

function getProfileFallback(uid) {
  const filePath = getLocalProfilePath(uid);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

// POST route to sync user profile data
app.post('/api/user/sync', async (req, res) => {
  const { uid, ...profileData } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'uid parameter is required for workspace sync' });
  }

  // If MongoDB is offline, use filesystem fallback immediately
  if (mongoose.connection.readyState !== 1) {
    try {
      const localProfile = saveProfileFallback(uid, profileData);
      return res.json({ success: true, profile: localProfile });
    } catch (fallbackError) {
      return res.status(500).json({ error: fallbackError.message || 'Synchronization fallback failed' });
    }
  }

  try {
    const updatedAt = new Date().toISOString();
    
    // Calculate overall score pre-sync to ensure consistency with Mongoose pre-save hook
    let totalScore = 40;
    let componentsCount = 1;
    if (profileData.github && profileData.github.overallGitHubScore) {
      totalScore += profileData.github.overallGitHubScore;
      componentsCount++;
    }
    if (profileData.leetcode && profileData.leetcode.overallLeetCodeScore) {
      totalScore += profileData.leetcode.overallLeetCodeScore;
      componentsCount++;
    }
    if (profileData.resume && profileData.resume.atsScore) {
      totalScore += profileData.resume.atsScore;
      componentsCount++;
    }
    const overallScore = Math.round(totalScore / componentsCount);

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { uid },
      { ...profileData, overallScore, updatedAt },
      { upsert: true, new: true }
    );
    
    try {
      saveProfileFallback(uid, profileData);
    } catch (e) {}

    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.warn('MongoDB sync failed, attempting filesystem fallback:', error.message || error);
    try {
      const localProfile = saveProfileFallback(uid, profileData);
      res.json({ success: true, profile: localProfile });
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || 'Synchronization failed' });
    }
  }
});

// GET route to fetch the profile data by uid
app.get('/api/user/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ error: 'uid parameter is required' });
  }

  // If MongoDB is offline, use filesystem fallback immediately
  if (mongoose.connection.readyState !== 1) {
    try {
      const localProfile = getProfileFallback(uid);
      if (!localProfile) {
        return res.status(404).json({ error: `User profile with UID ${uid} not found locally` });
      }
      return res.json(localProfile);
    } catch (fallbackError) {
      return res.status(500).json({ error: fallbackError.message || 'Fetch fallback failed' });
    }
  }

  try {
    const profile = await UserProfile.findOne({ uid });
    if (!profile) {
      const localProfile = getProfileFallback(uid);
      if (localProfile) {
        return res.json(localProfile);
      }
      return res.status(404).json({ error: `User profile with UID ${uid} not found` });
    }
    res.json(profile);
  } catch (error) {
    console.warn(`MongoDB fetch failed for UID ${uid}, trying local filesystem:`, error.message || error);
    try {
      const localProfile = getProfileFallback(uid);
      if (!localProfile) {
        return res.status(404).json({ error: `User profile with UID ${uid} not found in fallback storage` });
      }
      res.json(localProfile);
    } catch (fallbackError) {
      res.status(500).json({ error: error.message || 'Fetch failed' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Backend decoupling server is running on port ${PORT}`);
});
