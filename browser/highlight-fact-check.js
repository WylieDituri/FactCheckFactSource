/**
 * Keyboard Shortcut Fact-Checking Feature
 * Press Ctrl+Shift+F (or Cmd+Shift+F) to fact-check highlighted text
 */

let selectedText = '';

// Handle keyboard shortcut: Ctrl+Shift+F (or Cmd+Shift+F)
function handleKeyboardShortcut(e) {
  // Check for Ctrl+Shift+F or Cmd+Shift+F
  const isFactCheckShortcut = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f';
  
  if (isFactCheckShortcut) {
    e.preventDefault();
    e.stopPropagation();
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      console.log('⌨️ Fact-check shortcut triggered in main window');
      selectedText = text;
      factCheckHighlightedText(text);
      showFactCheckToast('🔍 Fact-checking...');
    } else {
      showFactCheckToast('⚠️ Please highlight some text first', true);
    }
    
    return false;
  }
}

// Show toast notification
function showFactCheckToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? '#ff6b6b' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(${isError ? '255, 107, 107' : '102, 126, 234'}, 0.4);
    z-index: 1000001;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
  `;
  toast.innerHTML = message;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  if (!document.querySelector('style[data-toast-styles]')) {
    style.setAttribute('data-toast-styles', 'true');
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Fact check the highlighted text (globally accessible)
window.factCheckHighlightedText = async function(text) {
  console.log('🔍 Fact-checking highlighted text:', text.substring(0, 50) + '...');
  
  // Create modal to show results
  const modal = document.createElement('div');
  modal.id = 'highlight-fact-check-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; margin: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); animation: slideUp 0.3s ease;">
      <div style="padding: 24px; border-bottom: 2px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white; border-radius: 16px 16px 0 0; z-index: 10;">
        <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: 700;">🔍 Fact Checking...</h2>
        <button id="close-highlight-modal" style="background: none; border: none; font-size: 32px; cursor: pointer; color: #999; padding: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;">&times;</button>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #667eea; margin-top: 0; margin-bottom: 12px; font-size: 16px; font-weight: 600;">Highlighted Text:</h3>
          <div style="padding: 16px; background: #f5f7ff; border-radius: 8px; border-left: 4px solid #667eea; font-size: 14px; line-height: 1.8; color: #333; max-height: 150px; overflow-y: auto;">${text}</div>
        </div>
        
        <div id="highlight-fact-check-results">
          <div style="text-align: center; padding: 40px;">
            <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #ff6b6b; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div style="margin-top: 20px; color: #666; font-weight: 600; font-size: 16px;">Analyzing with AI...</div>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      #close-highlight-modal:hover {
        background: #f5f5f5;
        color: #333;
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  
  // Close button handler
  document.getElementById('close-highlight-modal').addEventListener('click', () => {
    modal.remove();
  });
  
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Perform fact check using same method as voice recording
  try {
    const geminiKey = window.process && window.process.env && window.process.env.GOOGLE_API_KEY;
    const openaiKey = window.process && window.process.env && window.process.env.OPENAI_API_KEY;
    
    if (!geminiKey && !openaiKey) {
      throw new Error('No AI API key configured. Add GOOGLE_API_KEY or OPENAI_API_KEY to your .env file.');
    }
    
    // Use Gemini first, fallback to OpenAI
    const client = geminiKey ? new GeminiClient(geminiKey) : new OpenAIClient(openaiKey);
    const modelName = geminiKey ? 'Gemini AI' : 'ChatGPT';
    
    const factCheckPrompt = `You are a fact-checking AI agent. First, determine if the text contains factual claims that need verification.

Text:
"${text}"

IMPORTANT: If the text is NOT a declarative statement with verifiable facts (e.g., it's a question, greeting, opinion without facts, navigation text, random text, etc.), respond with EXACTLY this format:
"NOT_VERIFIABLE: [brief explanation why this text doesn't need fact-checking]"

Otherwise, if it DOES contain factual claims, provide:
1. **Claims Identified**: List all factual claims made in the text
2. **Verification Status**: For each claim, indicate if it's TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIABLE
3. **Evidence**: Provide brief reasoning or context for each verification
4. **Overall Assessment**: Give a summary of the factual accuracy
5. **Confidence Level**: Rate your confidence in the fact-check (High/Medium/Low)

Format your response in a clear, structured way.`;

    const response = await client.generateContent(factCheckPrompt);
    
    console.log('✅ Fact-check complete');
    
    // Check if the text is not verifiable
    const isNotVerifiable = response.text.trim().startsWith('NOT_VERIFIABLE:');
    
    // Display results
    const resultsDiv = document.getElementById('highlight-fact-check-results');
    if (resultsDiv) {
      if (isNotVerifiable) {
        // Extract the explanation after "NOT_VERIFIABLE:"
        const explanation = response.text.replace('NOT_VERIFIABLE:', '').trim();
        
        resultsDiv.innerHTML = `
          <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid #9e9e9e; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #f0f0f0;">
              <span style="font-size: 32px;">ℹ️</span>
              <strong style="color: #757575; font-size: 24px;">No Fact-Checking Needed</strong>
            </div>
            <div style="color: #555; line-height: 1.8; font-size: 16px;">
              <p style="margin: 0; padding: 16px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #9e9e9e;">
                ${explanation}
              </p>
            </div>
          </div>
          <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 8px; border-left: 4px solid #2196f3;">
            <strong style="color: #1565c0; font-size: 16px;">💡 Tip: Fact-checking works best with declarative statements containing factual claims.</strong>
          </div>
        `;
      } else {
        // Format response using same formatter as voice recording
        const formattedResponse = formatFactCheckResponse(response.text);
        
        resultsDiv.innerHTML = `
          <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid #ff6b6b; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #ffe0e0;">
              <span style="font-size: 32px;">🔍</span>
              <strong style="color: #ff6b6b; font-size: 24px;">Fact Check Results</strong>
            </div>
            <div style="color: #333; line-height: 1.8;">${formattedResponse}</div>
          </div>
          <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 8px; border-left: 4px solid #4caf50;">
            <strong style="color: #2e7d32; font-size: 16px;">✅ Analysis complete using ${modelName}</strong>
          </div>
        `;
      }
    }
    
  } catch (error) {
    console.error('❌ Fact-check error:', error);
    const resultsDiv = document.getElementById('highlight-fact-check-results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div style="color: #ff4444; padding: 24px; background: #ffebee; border-radius: 8px; border-left: 4px solid #ff4444;">
          <strong style="font-size: 18px;">⚠️ Fact-Check Error</strong><br><br>
          ${error.message}
        </div>
      `;
    }
  }
};

// Initialize the feature
function initHighlightFactCheck() {
  console.log('🔍 Keyboard shortcut fact-check feature initialized');
  console.log('⌨️  Press Ctrl+Shift+F (or Cmd+Shift+F) to fact-check highlighted text');
  
  // Listen for keyboard shortcut
  document.addEventListener('keydown', handleKeyboardShortcut, true);
  window.addEventListener('keydown', handleKeyboardShortcut, true);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHighlightFactCheck);
} else {
  initHighlightFactCheck();
}

console.log('✅ Keyboard shortcut fact-check module loaded');
console.log('⌨️  Shortcut: Ctrl+Shift+F (Windows/Linux) or Cmd+Shift+F (Mac)');
