/**
 * Configuration file for Fish Audio and other services
 * 
 * SECURITY NOTE: In production, never store API keys in client-side code!
 * Use a backend server to proxy API requests with server-side API keys.
 */

// Function to get API key from environment variable
function getEnvVar(key, defaultValue = '') {
  if (typeof window !== 'undefined' && window.process && window.process.env) {
    console.log(window.process.env[key] || defaultValue);
    return window.process.env[key] || defaultValue;
  }
  return defaultValue;
}

const config = {
  // Fish Audio API Configuration
  fishAudio: {
    // API key loaded from .env file via FISH_AUDIO_API_KEY variable
    get apiKey() {
      return getEnvVar('FISH_AUDIO_API_KEY');
    },
    baseUrl: 'https://api.fish.audio/v1',
    defaultLanguage: 'en-US',
  },
  
  // Google Gemini AI Configuration
  gemini: {
    // API key loaded from .env file via GOOGLE_API_KEY variable
    get apiKey() {
      return getEnvVar('GOOGLE_API_KEY');
    },
    model: 'gemini-pro',
    defaultTask: 'analyze', // Default AI task: summarize, analyze, fact-check, extract, sentiment, questions
  },
  
  // Recording Settings
  recording: {
    maxDuration: 300, // Maximum recording duration in seconds (5 minutes)
    format: 'audio/webm', // Audio format for recording
  },
  
  // UI Settings
  ui: {
    showFallbackWarning: true, // Show warning when using fallback transcription
    enableAIAnalysis: true, // Show AI analysis options
  }
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.BrowserConfig = config;
  
  // Debug: Log when config is loaded
  console.log('🔧 BrowserConfig loaded');
  console.log('  - Fish Audio API Key available:', !!config.fishAudio.apiKey);
  if (config.fishAudio.apiKey) {
    console.log('  - Key preview:', config.fishAudio.apiKey.substring(0, 15) + '...');
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

