/**
 * Fish Audio API Client for Speech-to-Text Transcription
 * 
 * This module handles communication with Fish Audio API for audio transcription.
 * You need to set up your Fish Audio API key in a .env file or environment variables.
 */

class FishAudioClient {
  constructor(apiKey) {
    // Use the API key passed as parameter
    // If not provided, try to get from window.process.env directly
    if (!apiKey && typeof window !== 'undefined' && window.process && window.process.env) {
      apiKey = window.process.env.FISH_AUDIO_API_KEY;
    }
    
    this.apiKey = apiKey || '';
    
    // Debug logging
    console.log('🔑 FishAudioClient initialized');
    console.log('  - API Key:', this.apiKey ? `✅ ${this.apiKey.substring(0, 15)}...` : '❌ NO KEY');
    
    this.baseUrl = 'https://api.fish.audio/v1';
  }

  /**
   * Transcribe audio using Fish Audio API
   * @param {Blob} audioBlob - The audio blob to transcribe
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribe(audioBlob, options = {}) {
    if (!this.apiKey) {
      throw new Error('Fish Audio API key is not configured');
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', options.language || 'en-US');
    
    if (options.model) {
      formData.append('model', options.model);
    }

    try {
      const response = await fetch(`${this.baseUrl}/asr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Fish Audio API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      return {
        text: result.text || result.transcription || '',
        confidence: result.confidence,
        language: result.language,
        timestamp: new Date().toISOString(),
        audioSize: audioBlob.size,
        format: audioBlob.type
      };
    } catch (error) {
      console.error('Fish Audio transcription error:', error);
      throw error;
    }
  }

  /**
   * Check if API key is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FishAudioClient;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.FishAudioClient = FishAudioClient;
}

