import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfessionBox from './components/ConfessionBox';
import TicketAnimation from './components/TicketAnimation';
import GlitchText from './components/GlitchText';
import './App.css';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

function App() {
  const [submissionCount, setSubmissionCount] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [showTickets, setShowTickets] = useState(false);
  const [ticketsToShow, setTicketsToShow] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/confessions/stats`, {
        withCredentials: true
      });
      setSubmissionCount(response.data.submissionCount);
      setTotalTickets(response.data.totalTickets);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (content) => {
    const questionType = submissionCount < getRandomThreshold() ? 'about_yourself' : 'secret';
    
    try {
      const response = await axios.post(
        `${API_URL}/confessions`,
        { content, questionType },
        { withCredentials: true }
      );

      const { ticketsAwarded, submissionCount: newCount } = response.data;
      
      setSubmissionCount(newCount);
      setTicketsToShow(ticketsAwarded);
      setShowTickets(true);
      
      setTimeout(() => {
        setShowTickets(false);
        setTotalTickets(prev => prev + ticketsAwarded);
      }, 3000);

      return true;
    } catch (error) {
      console.error('Error submitting confession:', error);
      return false;
    }
  };

  const getRandomThreshold = () => {
    return Math.floor(Math.random() * 4) + 3; // 3-6
  };

  const getCurrentQuestion = () => {
    if (submissionCount < getRandomThreshold()) {
      return "Tell me something about yourself.";
    }
    return "Tell me a secret.";
  };

  return (
    
      
      
      
      
      
      
        TICKETS COLLECTED
        {totalTickets}
      

      

      {showTickets && (
        
      )}
    
  );
}

export default App;
```

### `client/src/App.css`
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Share Tech Mono', monospace;
  background: #0a0a0a;
  color: #0f0;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: 
    linear-gradient(0deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* CRT Effect */
.crt-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  background: 
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
  animation: flicker 0.15s infinite;
}

@keyframes flicker {
  0% { opacity: 0.97; }
  50% { opacity: 1; }
  100% { opacity: 0.97; }
}

/* Scanlines */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.05) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 0, 0, 0.05) 3px
  );
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% { transform: translateY(0); }
  100% { transform: translateY(100%); }
}

/* Ticket Counter */
.ticket-counter {
  position: fixed;
  top: 80px;
  right: 30px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #0f0;
  padding: 15px 25px;
  box-shadow: 
    0 0 10px rgba(0, 255, 0, 0.5),
    inset 0 0 10px rgba(0, 255, 0, 0.2);
  z-index: 100;
}

.ticket-label {
  font-size: 10px;
  letter-spacing: 2px;
  margin-bottom: 5px;
  opacity: 0.8;
}

.ticket-count {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 0 10px #0f0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { text-shadow: 0 0 10px #0f0; }
  50% { text-shadow: 0 0 20px #0f0, 0 0 30px #0f0; }
}

/* Responsive */
@media (max-width: 768px) {
  .ticket-counter {
    top: 70px;
    right: 10px;
    padding: 10px 15px;
  }
  
  .ticket-label {
    font-size: 8px;
  }
  
  .ticket-count {
    font-size: 24px;
  }
}