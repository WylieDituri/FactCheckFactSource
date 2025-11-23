/**
 * API Client for Gemini and OpenAI fact-checking
 */

/**
 * Fact check with Google Gemini
 */
export async function factCheckWithGemini(text, apiKey) {
  // Use EXACT same configuration as working browser gemini-client.js
  const model = 'gemini-1.5-flash';  // Try this model instead
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
  
  const factCheckPrompt = `You are a fact-checking AI agent. Analyze the following text and provide a detailed fact-check report.

Text:
"${text}"

Please provide:
1. **Claims Identified**: List all factual claims made in the text
2. **Verification Status**: For each claim, indicate if it's TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIABLE
3. **Evidence**: Provide brief reasoning or context for each verification
4. **Overall Assessment**: Give a summary of the factual accuracy
5. **Confidence Level**: Rate your confidence in the fact-check (High/Medium/Low)

Format your response in a clear, structured way.`;

  // Match browser's exact request format with generationConfig and safetySettings
  const requestBody = {
    contents: [{
      parts: [{ text: factCheckPrompt }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
    },
    safetySettings: [
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
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return {
    summary: responseText,
    score: calculateConfidenceScore(responseText),
    evidence: [],
    model: model
  };
}

/**
 * Fact check with OpenAI ChatGPT
 */
export async function factCheckWithOpenAI(text, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const factCheckPrompt = `You are a fact-checking AI agent. Analyze the following text and provide a detailed fact-check report.

Text:
"${text}"

Please provide:
1. **Claims Identified**: List all factual claims made in the text
2. **Verification Status**: For each claim, indicate if it's TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIABLE
3. **Evidence**: Provide brief reasoning or context for each verification
4. **Overall Assessment**: Give a summary of the factual accuracy
5. **Confidence Level**: Rate your confidence in the fact-check (High/Medium/Low)

Format your response in a clear, structured way.`;

  const requestBody = {
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: factCheckPrompt
    }],
    temperature: 0.7,
    max_tokens: 2048
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content || '';
  
  return {
    summary: responseText,
    score: calculateConfidenceScore(responseText),
    evidence: [],
    model: 'gpt-4o'
  };
}

/**
 * Calculate confidence score from response text
 */
function calculateConfidenceScore(text) {
  const lowerText = text.toLowerCase();
  
  // High confidence indicators
  if (lowerText.includes('high') && lowerText.includes('confidence')) {
    return 0.9;
  }
  
  // TRUE claims
  if (lowerText.includes('true') || lowerText.includes('verified') || lowerText.includes('accurate')) {
    return 0.85;
  }
  
  // Medium confidence
  if (lowerText.includes('medium') && lowerText.includes('confidence')) {
    return 0.6;
  }
  
  // PARTIALLY TRUE
  if (lowerText.includes('partially') || lowerText.includes('mixed')) {
    return 0.5;
  }
  
  // FALSE claims
  if (lowerText.includes('false') || lowerText.includes('inaccurate') || lowerText.includes('misleading')) {
    return 0.3;
  }
  
  // Low confidence
  if (lowerText.includes('low') && lowerText.includes('confidence')) {
    return 0.4;
  }
  
  // Default
  return 0.6;
}

