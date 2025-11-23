/**
 * Options/Settings Page Script
 */

import { getSettings, saveSettings } from '../utils/storage.js';

// DOM elements
const geminiKeyInput = document.getElementById('gemini-key');
const openaiKeyInput = document.getElementById('openai-key');
const modelGeminiRadio = document.getElementById('model-gemini');
const modelOpenaiRadio = document.getElementById('model-openai');
const saveBtn = document.getElementById('save-btn');
const saveStatus = document.getElementById('save-status');
const changeShortcutBtn = document.getElementById('change-shortcut-btn');

// Load settings on page load
loadSettings();

// Save button
saveBtn.addEventListener('click', async () => {
  const geminiKey = geminiKeyInput.value.trim();
  const openaiKey = openaiKeyInput.value.trim();
  
  if (!geminiKey && !openaiKey) {
    showStatus('⚠️ Please add at least one API key', 'error');
    return;
  }
  
  const preferredModel = modelGeminiRadio.checked ? 'gemini' : 'openai';
  
  // Validate chosen model has key
  if (preferredModel === 'gemini' && !geminiKey) {
    showStatus('⚠️ Please add Gemini API key or choose OpenAI', 'error');
    return;
  }
  
  if (preferredModel === 'openai' && !openaiKey) {
    showStatus('⚠️ Please add OpenAI API key or choose Gemini', 'error');
    return;
  }
  
  // Save
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    await saveSettings({
      geminiApiKey: geminiKey,
      openaiApiKey: openaiKey,
      preferredModel: preferredModel
    });
    
    showStatus('✅ Settings saved successfully!', 'success');
    
    // Re-enable after 1 second
    setTimeout(() => {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }, 1000);
    
  } catch (error) {
    console.error('Save error:', error);
    showStatus('❌ Failed to save settings', 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Settings';
  }
});

// Change shortcut button
changeShortcutBtn.addEventListener('click', () => {
  chrome.tabs.create({
    url: 'chrome://extensions/shortcuts'
  });
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const settings = await getSettings();
    
    if (settings.geminiApiKey) {
      geminiKeyInput.value = settings.geminiApiKey;
    }
    
    if (settings.openaiApiKey) {
      openaiKeyInput.value = settings.openaiApiKey;
    }
    
    if (settings.preferredModel === 'openai') {
      modelOpenaiRadio.checked = true;
    } else {
      modelGeminiRadio.checked = true;
    }
    
  } catch (error) {
    console.error('Load error:', error);
    showStatus('❌ Failed to load settings', 'error');
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'success') {
  saveStatus.textContent = message;
  saveStatus.className = `save-status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      saveStatus.textContent = '';
      saveStatus.className = 'save-status';
    }, 3000);
  }
}

