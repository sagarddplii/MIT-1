import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add custom CSS for enhanced animations and effects
const style = document.createElement('style');
style.textContent = `
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #2563eb, #7c3aed);
  }

  /* Enhanced focus styles */
  *:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Smooth transitions for all interactive elements */
  button, a, input, textarea, select {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Custom gradient text animation */
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }

  /* Enhanced backdrop blur support */
  @supports (backdrop-filter: blur(10px)) {
    .backdrop-blur-enhanced {
      backdrop-filter: blur(10px) saturate(180%);
    }
  }

  /* Custom loading animation */
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .shimmer {
    position: relative;
    overflow: hidden;
  }

  .shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 1.5s infinite;
  }

  /* Glassmorphism effect */
  .glass {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  /* Enhanced shadows */
  .shadow-premium {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .shadow-glow {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  /* Custom selection */
  ::selection {
    background: rgba(59, 130, 246, 0.2);
    color: #1e40af;
  }

  /* Print styles */
  @media print {
    .no-print {
      display: none !important;
    }
    
    body {
      background: white !important;
    }
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
