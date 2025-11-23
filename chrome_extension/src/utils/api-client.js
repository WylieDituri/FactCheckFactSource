/**
 * API Client for Gemini and OpenAI fact-checking
 */

/**
 * Fact check with Google Gemini
 */
export async function factCheckWithGemini(text, apiKey) {
  // Use EXACT same model as working browser
  const model = 'gemini-2.0-flash';  // Updated to latest flash model for speed/cost
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  const factCheckPrompt = `You are a fact-checking AI agent. Analyze the following text.
  
Text: "${text}"

Return a JSON object with the following structure:
{
  "status": "VERIFIED" | "DEBUNKED" | "PARTIALLY_TRUE" | "UNVERIFIABLE" | "NOT_FACTUAL",
  "confidence": number (0.0 to 1.0),
  "summary": "Concise markdown summary of the fact check.",
  "sources": [
    { "name": "Source Name", "domain": "source.com", "url": "https://source.com/article" }
  ],
  "claims": [
    { "claim": "The specific claim", "status": "TRUE" | "FALSE" | "MIXED", "reasoning": "Why" }
  ]
}

If the text is not a factual claim (e.g. opinion, question), set status to "NOT_FACTUAL".
Ensure the "sources" array contains real, reputable sources that would verify or debunk this.
Do NOT use markdown code blocks in the output, just raw JSON.`;

  const requestBody = {
    contents: [{
      parts: [{ text: factCheckPrompt }]
    }],
    generationConfig: {
      temperature: 0.4, // Lower temperature for more deterministic JSON
      responseMimeType: "application/json"
    }
  };

  try {
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
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON:", responseText);
      // Fallback
      return {
        summary: responseText,
        score: 0.5,
        status: 'UNKNOWN',
        sources: [],
        isNotVerifiable: false
      };
    }

    return {
      summary: parsedData.summary,
      score: parsedData.confidence,
      status: parsedData.status,
      sources: parsedData.sources || [],
      claims: parsedData.claims || [],
      model: model,
      isNotVerifiable: parsedData.status === 'NOT_FACTUAL'
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

/**
 * Fact check with OpenAI ChatGPT
 */
export async function factCheckWithOpenAI(text, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const factCheckPrompt = `You are a fact-checking AI agent. Analyze the following text.
  
Text: "${text}"

Return a JSON object with the following structure:
{
  "status": "VERIFIED" | "DEBUNKED" | "PARTIALLY_TRUE" | "UNVERIFIABLE" | "NOT_FACTUAL",
  "confidence": number (0.0 to 1.0),
  "summary": "Concise markdown summary of the fact check.",
  "sources": [
    { "name": "Source Name", "domain": "source.com", "url": "https://source.com/article" }
  ],
  "claims": [
    { "claim": "The specific claim", "status": "TRUE" | "FALSE" | "MIXED", "reasoning": "Why" }
  ]
}

If the text is not a factual claim, set status to "NOT_FACTUAL".
Ensure the "sources" array contains real, reputable sources.`;

  const requestBody = {
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: factCheckPrompt
    }],
    temperature: 0.4,
    response_format: { type: "json_object" }
  };

  try {
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
    const responseText = data.choices?.[0]?.message?.content || '{}';

    const parsedData = JSON.parse(responseText);

    return {
      summary: parsedData.summary,
      score: parsedData.confidence,
      status: parsedData.status,
      sources: parsedData.sources || [],
      claims: parsedData.claims || [],
      model: 'gpt-4o',
      isNotVerifiable: parsedData.status === 'NOT_FACTUAL'
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw error;
  }
}

/**
 * Analyze YouTube Transcript
 */
export async function analyzeTranscript(transcript, apiKey) {
  // Use Gemini Flash for long context window and speed
  const model = 'gemini-2.0-flash';
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  // Format transcript for the prompt
  // We group text into chunks with timestamps to help the AI identify when things were said
  const formattedTranscript = transcript
    .map(t => `[${t.start.toFixed(0)}s] ${t.text}`)
    .join('\n');

  // Debug logging
  console.log(`📝 Analyzing transcript: ${transcript.length} lines`);
  console.log(`📝 Formatted transcript length: ${formattedTranscript.length} chars`);
  console.log(`📝 Transcript sample (first 500 chars):\n${formattedTranscript.substring(0, 500)}`);


  const prompt = `You are a strict fact-checking assistant. Your goal is to identify claims that are WORTH fact-checking.
  
Transcript:
${formattedTranscript.substring(0, 30000)} ...

CRITICAL RULES:

1. **PRIORITIZE "HIGH-STAKES" CLAIMS**:
   - 🟢 **Extract**: Controversial statements, specific statistics ("GDP grew by 5%"), historical assertions, cause-and-effect claims ("X causes Y"), and bold predictions.
   - 🔴 **IGNORE**: Trivial facts ("Paris is in France"), definitions ("A cat is an animal"), and subjective feelings ("I felt sad").

2. **HANDLING PERSONAL NARRATIVES**:
   - ❌ **STRICTLY REJECT** claims starting with "I", "Me", "My", "We", "Our" unless they contain a verifiable *external* fact.
   - ❌ **REJECT**: "I moved from Lebanon", "I'm British", "My mom spoke Tagalog", "I lived in England".
   - 🟢 **ACCEPT**: "The war in Lebanon started in 2006" (extracted from "I moved during the war").
   - If a sentence is purely personal history ("I was born in Iran"), **IGNORE IT**.

3. **VERIFICATION STATUS**:
   - For each claim, determine if it is TRUE, FALSE, MISLEADING, or UNVERIFIABLE based on your knowledge base.
   - **PROVIDE SOURCES** if possible (e.g., "According to World Bank...").

Return a JSON object:
{
  "claims": [
    {
      "timestamp": number (seconds),
      "claim": "The specific claim text",
      "status": "VERIFIED" | "DEBUNKED" | "MISLEADING" | "UNVERIFIABLE",
      "correction": "Brief context/correction",
      "sources": ["Source 1", "Source 2"]
    }
  ]
}

If NO substantial claims are found, return { "claims": [] }.
`;

  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?|```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Transcript Analysis Error:", error);
    throw error;
  }
}

/**
 * Verify a claim using the Agent Server
 */
export async function verifyClaimWithAgent(claimText) {
  try {
    const response = await fetch('http://127.0.0.1:8000/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: claimText })
    });

    if (!response.ok) {
      throw new Error(`Agent Server error: ${response.status}`);
    }

    const data = await response.json();
    const agentText = data.result;

    // Parse Agent Response
    // Format:
    // Claim: ...
    // Search Summary: ...
    // Sources: ...
    // Verification: ...

    const summaryMatch = agentText.match(/Search Summary:\s*(.*?)(?=Sources:|Verification:|$)/s);
    const sourcesMatch = agentText.match(/Sources:\s*(.*?)(?=Verification:|$)/s);
    const verificationMatch = agentText.match(/Verification:\s*(.*?)(?=$)/s);

    const summary = summaryMatch ? summaryMatch[1].trim() : "No summary provided.";
    const sourcesText = sourcesMatch ? sourcesMatch[1].trim() : "";
    const verification = verificationMatch ? verificationMatch[1].trim().toLowerCase() : "unknown";

    // Map verification to status
    let status = 'UNVERIFIABLE';
    if (verification.includes('true')) status = 'VERIFIED';
    if (verification.includes('false')) status = 'DEBUNKED';
    if (verification.includes('unverifiable')) status = 'UNVERIFIABLE';

    // Parse sources (simple split by newline or comma)
    const sources = sourcesText.split(/\n|,/).map(s => s.trim()).filter(s => s.length > 0 && s.startsWith('http'));

    return {
      status,
      correction: summary,
      sources
    };

  } catch (error) {
    console.error("Agent Verification Error:", error);
    return {
      status: 'UNVERIFIABLE',
      correction: "Could not verify with agent.",
      sources: []
    };
  }
}


