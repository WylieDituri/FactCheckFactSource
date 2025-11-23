/**
 * Background Service Worker (Manifest V3)
 * Handles API calls, context menu, keyboard shortcuts, and message routing
 */

import { factCheckWithGemini, factCheckWithOpenAI } from '../utils/api-client.js';
import { saveToHistory, getSettings } from '../utils/storage.js';

console.log('🔧 Carmonic Verify Service Worker loaded');

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

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'fact-check') {
    console.log('⌨️ Fact-check keyboard shortcut triggered');
    
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Request selected text from content script
    chrome.tabs.sendMessage(tab.id, { 
      action: 'getSelection' 
    }, async (response) => {
      if (response && response.text) {
        await performFactCheck(response.text, tab.id);
      } else {
        // Show "no text selected" notification
        chrome.tabs.sendMessage(tab.id, {
          action: 'showToast',
          message: '⚠️ Please highlight some text first',
          type: 'error'
        });
      }
    });
  }
});

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

