/**
 * Google Gemini AI Client
 * 
 * This module handles communication with Google's Gemini AI API.
 * Configure your API key in config.js or environment variables.
 */

class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-2.5-pro';  // Original model - revert to test
  }

  /**
   * Send a prompt to Gemini and get a response
   * @param {string} prompt - The prompt to send to the model
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The model's response
   */
  async generateContent(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const model = options.model || this.model;
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 2048,
          },
          safetySettings: options.safetySettings || [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Extract the text from the response
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        text: text,
        fullResponse: result,
        finishReason: result.candidates?.[0]?.finishReason,
        safetyRatings: result.candidates?.[0]?.safetyRatings,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Generate content with image using Gemini Vision API
   * @param {string} prompt - The prompt to send to the model
   * @param {string} base64Image - The base64 encoded image
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The model's response
   */
  async generateContentWithImage(prompt, base64Image, options = {}) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const model = options.model || this.model;
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { 
            inline_data: { 
              mime_type: 'image/jpeg',
              data: base64Image 
            } 
          }
        ]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(`Gemini Vision API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return { text, fullResponse: data, model };
  }

  /**
   * Analyze transcribed text with Gemini
   * @param {Object} transcription - The transcription object
   * @param {string} task - The task to perform (summarize, analyze, fact-check, etc.)
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeTranscription(transcription, task = 'summarize') {
    const prompts = {
      summarize: `Please summarize the following transcribed speech:\n\n"${transcription.text}"`,
      analyze: `Please analyze the following transcribed speech and provide insights:\n\n"${transcription.text}"`,
      'fact-check': `Please fact-check the following transcribed speech and identify any claims that may need verification:\n\n"${transcription.text}"`,
      extract: `Please extract the key points and main ideas from the following transcribed speech:\n\n"${transcription.text}"`,
      sentiment: `Please analyze the sentiment and tone of the following transcribed speech:\n\n"${transcription.text}"`,
      questions: `Please generate relevant questions based on the following transcribed speech:\n\n"${transcription.text}"`
    };

    const prompt = prompts[task] || prompts.summarize;
    
    const response = await this.generateContent(prompt);
    
    return {
      task: task,
      input: transcription,
      response: response.text,
      fullResponse: response,
      timestamp: new Date().toISOString()
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
   * List available models
   * @returns {Promise<Array>} - List of available models
   */
  async listModels() {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const url = `${this.baseUrl}/models?key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      const result = await response.json();
      return result.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiClient;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.GeminiClient = GeminiClient;
}

