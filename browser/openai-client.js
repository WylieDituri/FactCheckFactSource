/**
 * OpenAI ChatGPT Client
 * 
 * This module handles communication with OpenAI's ChatGPT API.
 * Configure your API key in .env file.
 */

class OpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey || '';
    this.baseUrl = 'https://api.openai.com/v1';
    this.model = 'gpt-4o';
  }

  /**
   * Send a prompt to ChatGPT and get a response
   * @param {string} prompt - The prompt to send to the model
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The model's response
   */
  async generateContent(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const model = options.model || this.model;
    const url = `${this.baseUrl}/chat/completions`;

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2048
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    return { text, fullResponse: data, model };
  }

  /**
   * Generate content with image using GPT-4 Vision
   * @param {string} prompt - The prompt to send to the model
   * @param {string} base64Image - The base64 encoded image
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The model's response
   */
  async generateContentWithImage(prompt, base64Image, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const model = options.model || 'gpt-4o';
    const url = `${this.baseUrl}/chat/completions`;

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: options.max_tokens || 2048
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(`OpenAI Vision API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    return { text, fullResponse: data, model };
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
  module.exports = OpenAIClient;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.OpenAIClient = OpenAIClient;
}

console.log('🤖 OpenAI client loaded');

