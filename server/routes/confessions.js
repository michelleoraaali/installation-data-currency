const express = require('express');
const router = express.Router();
const Confession = require('../models/Confession');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Analyze emotional valence using OpenAI
async function analyzeEmotionalValence(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an emotional content analyzer. Rate the emotional depth and personal significance of the following text on a scale of 1-10, where:
          1-3: Mundane, factual information (name, favorite color, simple preferences)
          4-6: Moderately personal (opinions, experiences, light emotions)
          7-10: Deeply personal, emotional, traumatic, or significant revelations
          
          Respond with ONLY a number between 1 and 10.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const score = parseInt(response.choices[0].message.content.trim());
    return isNaN(score) ? 1 : Math.min(Math.max(score, 1), 10);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback: simple heuristic based on length and keywords
    return calculateFallbackScore(text);
  }
}

function calculateFallbackScore(text) {
  const emotionalKeywords = ['feel', 'felt', 'hurt', 'pain', 'scared', 'afraid', 'love', 'hate', 'trauma', 'died', 'death', 'abuse', 'depression', 'anxiety', 'secret', 'ashamed', 'regret', 'guilty'];
  const lowerText = text.toLowerCase();
  
  let score = 1;
  
  // Length factor
  if (text.length > 100) score += 1;
  if (text.length > 200) score += 1;
  
  // Emotional keyword factor
  const keywordCount = emotionalKeywords.filter(kw => lowerText.includes(kw)).length;
  score += Math.min(keywordCount * 2, 6);
  
  return Math.min(score, 10);
}

function calculateTickets(emotionalScore) {
  if (emotionalScore <= 3) return 1;
  if (emotionalScore <= 5) return 2;
  if (emotionalScore <= 7) return 3;
  if (emotionalScore <= 9) return 5;
  return 10;
}

// Submit confession
router.post('/', async (req, res) => {
  try {
    const { content, questionType } = req.body;
    
    if (!content || !questionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create session ID
    if (!req.session.sessionId) {
      req.session.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Analyze emotional valence
    const emotionalScore = await analyzeEmotionalValence(content);
    const ticketsAwarded = calculateTickets(emotionalScore);

    // Save confession
    const confession = new Confession({
      sessionId: req.session.sessionId,
      content,
      questionType,
      emotionalScore,
      ticketsAwarded
    });

    await confession.save();

    // Get submission count for this session
    const submissionCount = await Confession.countDocuments({ 
      sessionId: req.session.sessionId 
    });

    res.json({
      success: true,
      ticketsAwarded,
      emotionalScore,
      submissionCount,
      sessionId: req.session.sessionId
    });
  } catch (error) {
    console.error('Error saving confession:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session stats
router.get('/stats', async (req, res) => {
  try {
    if (!req.session.sessionId) {
      return res.json({ submissionCount: 0, totalTickets: 0 });
    }

    const confessions = await Confession.find({ 
      sessionId: req.session.sessionId 
    });

    const totalTickets = confessions.reduce((sum, c) => sum + c.ticketsAwarded, 0);

    res.json({
      submissionCount: confessions.length,
      totalTickets
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route to view all confessions (protect this in production!)
router.get('/admin/all', async (req, res) => {
  try {
    // Add authentication middleware here in production
    const adminKey = req.query.key;
    
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const confessions = await Confession.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(confessions);
  } catch (error) {
    console.error('Error fetching confessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

### `client/package.json`
```json
{
  "name": "client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

### `client/vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});