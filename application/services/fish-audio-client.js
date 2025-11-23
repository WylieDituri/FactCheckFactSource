/**
 * Fish Audio API Client for Speech-to-Text Transcription
 * 
 * This module handles communication with Fish Audio API for audio transcription.
 * You need to set up your Fish Audio API key in a .env file or environment variables.
 */

class FishAudioClient {
  constructor(apiKey) {
    this.apiKey = apiKey || '';
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

    // Simple STT conversion - just send audio
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(`${this.baseUrl}/asr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fish Audio API error: ${response.status}`);
    }

    const res = await response.json();
    
    return {
      text: res.text || '',
      timestamp: new Date().toISOString(),
      audioSize: audioBlob.size,
      format: audioBlob.type
    };
  }

  /**
   * Check if API key is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Test the API key by checking account status
   * @returns {Promise<Object>} - Account info or error
   */
  async testAPIKey() {
    if (!this.apiKey) {
      return { 
        success: false, 
        error: 'No API key configured' 
      };
    }

    console.log('🔑 Testing Fish Audio API key...');
    
    try {
      // Try to access a simple endpoint to verify the key
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      console.log('  - Response status:', response.status);

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Invalid API key - Please check your Fish Audio dashboard'
        };
      }

      if (response.status === 402) {
        return {
          success: false,
          error: 'Insufficient balance - Please add credits to your Fish Audio account'
        };
      }

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'API key is valid',
          data: data
        };
      }

      return {
        success: false,
        error: `Unexpected response: ${response.status}`
      };

    } catch (error) {
      console.error('  - Test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
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

