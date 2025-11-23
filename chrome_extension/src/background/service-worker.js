/**
 * Background Service Worker (Manifest V3)
 * Handles API calls, context menu, keyboard shortcuts, and message routing
 */

import { factCheckWithGemini, factCheckWithOpenAI, analyzeTranscript, verifyClaimWithAgent } from '../utils/api-client.js';
import { saveToHistory, getSettings } from '../utils/storage.js';
import { fetchTranscript, extractVideoId } from '../utils/youtube.js';

console.log('🔧 FactFinder Service Worker loaded');

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'fact-check-selection',
    title: '🔍 Fact Check Selection',
    contexts: ['selection']
  });

  console.log('✅ Context menu created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'fact-check-selection' && info.selectionText) {
    console.log('📝 Fact-checking from context menu:', info.selectionText.substring(0, 50));
    await performFactCheck(info.selectionText, tab.id);
  }
});

// Keyboard shortcut handled by content script manually

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request.action);

  if (request.action === 'factCheck') {
    // Perform fact check
    performFactCheck(request.text, sender.tab?.id)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'analyzeVideo') {
    // Analyze YouTube video
    performVideoAnalysis(request.url, sender.tab?.id)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'getHistory') {
    // Get fact-check history
    chrome.storage.local.get(['history'], (data) => {
      sendResponse({ history: data.history || [] });
    });
    return true;
  }

  if (request.action === 'clearHistory') {
    // Clear history
    chrome.storage.local.set({ history: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

/**
 * Perform video analysis
 */
async function performVideoAnalysis(url, tabId) {
  try {
    console.log('🎥 Starting video analysis:', url);

    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    // Get settings
    const settings = await getSettings();
    const apiKey = settings.geminiApiKey || settings.openaiApiKey;

    if (!apiKey) {
      throw new Error('No API key configured. Please add an API key in the extension options.');
    }

    // 1. Fetch Transcript
    const transcript = await fetchTranscript(videoId);
    console.log(`📝 Transcript fetched: ${transcript.length} lines`);

    // 2. Analyze with AI
    const analysis = await analyzeTranscript(transcript, apiKey);
    console.log('✅ Analysis complete:', analysis);

    // 3. Verify claims with Agent
    if (analysis.claims && analysis.claims.length > 0) {
      console.log(`🕵️‍♀️ Verifying ${analysis.claims.length} claims with Agent...`);

      // Notify user verification is starting
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          action: 'showToast',
          message: `🔍 Found ${analysis.claims.length} claims. Verifying with Agent...`,
          type: 'info'
        });
      }

      for (let i = 0; i < analysis.claims.length; i++) {
        const claimObj = analysis.claims[i];
        // Only verify if not already verified/debunked with high confidence
        // But for now, let's verify everything to be sure
        try {
          const verification = await verifyClaimWithAgent(claimObj.claim);

          // Update claim object
          analysis.claims[i] = {
            ...claimObj,
            status: verification.status,
            correction: verification.correction,
            sources: verification.sources
          };
        } catch (e) {
          console.error(`Failed to verify claim "${claimObj.claim}":`, e);
        }
      }
    }

    // 4. Send back to content script
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'videoClaimsAnalyzed',
        claims: analysis.claims
      });
    }

    return analysis;

  } catch (error) {
    console.error('❌ Video analysis error:', error);

    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'showToast',
        message: `⚠️ Error: ${error.message}`,
        type: 'error'
      });
    }
    throw error;
  }
}

/**
 * Perform fact check using configured AI model
 */
async function performFactCheck(text, tabId) {
  try {
    console.log('🤖 Starting fact check...');

    // Get settings
    const settings = await getSettings();

    if (!settings.geminiApiKey && !settings.openaiApiKey) {
      throw new Error('No API key configured. Please add an API key in the extension options.');
    }

    // Show loading toast
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'showToast',
        message: '🔍 Fact-checking...',
        type: 'info'
      });
    }

    // Choose AI model
    let result;
    if (settings.preferredModel === 'openai' && settings.openaiApiKey) {
      result = await factCheckWithOpenAI(text, settings.openaiApiKey);
    } else if (settings.geminiApiKey) {
      result = await factCheckWithGemini(text, settings.geminiApiKey);
    } else if (settings.openaiApiKey) {
      result = await factCheckWithOpenAI(text, settings.openaiApiKey);
    } else {
      throw new Error('No valid API key found');
    }

    // Save to history
    await saveToHistory({
      text: text.substring(0, 200),
      result: result.summary,
      score: result.score,
      timestamp: Date.now()
    });

    // Send result to content script
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'showFactCheckResult',
        data: {
          text,
          ...result
        }
      });
    }

    console.log('✅ Fact check complete');
    return result;

  } catch (error) {
    console.error('❌ Fact check error:', error);

    // Show error toast
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'showToast',
        message: `⚠️ Error: ${error.message}`,
        type: 'error'
      });
    }

    throw error;
  }
}

