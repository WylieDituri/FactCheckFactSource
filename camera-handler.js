/**
 * Camera Capture & OCR with Fact-Checking
 * Uses Gemini Vision API for text extraction from images
 */

// Camera Elements
const cameraBtn = document.getElementById('camera-btn');
const cameraModal = document.getElementById('camera-modal');
const cameraModalClose = document.getElementById('camera-modal-close');
const cameraPreview = document.getElementById('camera-preview');
const cameraCanvas = document.getElementById('camera-canvas');
const capturedImage = document.getElementById('captured-image');
const captureButton = document.getElementById('capture-button');
const captureButtonText = document.getElementById('capture-button-text');
const cameraStatus = document.getElementById('camera-status');
const cameraIcon = document.getElementById('camera-icon');
const ocrResult = document.getElementById('ocr-result');

let cameraStream = null;
let isCameraActive = false;

// Open camera modal
if (cameraBtn) {
  cameraBtn.addEventListener('click', () => {
    cameraModal.style.display = 'flex';
    cameraStatus.textContent = 'Ready to capture';
    captureButtonText.textContent = 'Start Camera';
  });
}

// Close camera modal
if (cameraModalClose) {
  cameraModalClose.addEventListener('click', () => {
    cameraModal.style.display = 'none';
    stopCamera();
  });
}

// Capture button handler
if (captureButton) {
  captureButton.addEventListener('click', async () => {
    if (!isCameraActive) {
      await startCamera();
    } else {
      await captureImage();
    }
  });
}

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
    });
    
    cameraPreview.srcObject = cameraStream;
    cameraPreview.style.display = 'block';
    capturedImage.style.display = 'none';
    
    isCameraActive = true;
    cameraIcon.textContent = '📸';
    cameraStatus.textContent = 'Camera active - Click to capture';
    captureButtonText.textContent = 'Capture Image';
    
    console.log('📷 Camera started');
  } catch (error) {
    console.error('Camera error:', error);
    cameraStatus.textContent = 'Camera access denied';
    alert('Could not access camera. Please grant camera permissions.');
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  cameraPreview.style.display = 'none';
  isCameraActive = false;
  console.log('📷 Camera stopped');
}

async function captureImage() {
  const canvas = cameraCanvas;
  const context = canvas.getContext('2d');
  
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  context.drawImage(cameraPreview, 0, 0);
  
  const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  
  capturedImage.src = imageDataUrl;
  capturedImage.style.display = 'block';
  cameraPreview.style.display = 'none';
  
  stopCamera();
  
  cameraIcon.textContent = '✨';
  cameraStatus.textContent = 'Processing image...';
  captureButtonText.textContent = 'Start Camera';
  
  console.log('📸 Image captured');
  
  await processImage(imageDataUrl);
}

async function processImage(imageDataUrl) {
  try {
    cameraStatus.textContent = 'Extracting text with Gemini Vision...';
    
    const extractedText = await extractTextFromImage(imageDataUrl);
    
    ocrResult.classList.add('show');
    ocrResult.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong style="color: #667eea;">Extracted Text:</strong>
      </div>
      <div style="margin-bottom: 16px; max-height: 150px; overflow-y: auto; padding: 12px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap;">${extractedText || 'No text detected in image'}</div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
        <button onclick="copyExtractedText()" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">Copy Text</button>
        <button onclick="saveCaptureJSON()" style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">Save JSON</button>
      </div>
      <div id="camera-ai-response-container"></div>
    `;
    
    cameraStatus.textContent = 'Text extraction complete!';
    
    window.currentCapture = {
      image: imageDataUrl,
      extractedText: extractedText,
      timestamp: new Date().toISOString()
    };
    
    if (extractedText && extractedText.trim().length > 0) {
      console.log('🤖 Auto-fact-checking extracted text...');
      setTimeout(() => autoFactCheckImage(extractedText), 500);
    }
    
  } catch (error) {
    console.error('Image processing error:', error);
    cameraStatus.textContent = 'Error processing image';
    ocrResult.innerHTML = `<div style="color: #ff4444;"><strong>Error:</strong> ${error.message}</div>`;
  }
}

async function extractTextFromImage(imageDataUrl) {
  const apiKey = window.process && window.process.env && window.process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google API key not configured');
  }
  
  const geminiClient = new GeminiClient(apiKey);
  const base64Image = imageDataUrl.split(',')[1];
  
  const prompt = 'Extract all text visible in this image. Return only the text content, preserving line breaks and formatting where applicable.';
  
  const response = await geminiClient.generateContentWithImage(prompt, base64Image);
  
  console.log('✅ Text extracted from image');
  return response.text;
}

async function autoFactCheckImage(extractedText) {
  const responseContainer = document.getElementById('camera-ai-response-container');
  
  if (!responseContainer) return;
  
  responseContainer.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #ff6b6b; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <div style="margin-top: 12px; color: #666; font-weight: 600;">🔍 Fact-checking...</div>
    </div>
  `;
  
  try {
    const apiKey = window.process && window.process.env && window.process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Google API key not configured');
    
    const geminiClient = new GeminiClient(apiKey);
    
    const factCheckPrompt = `You are a fact-checking AI agent. Analyze the following text extracted from an image and provide a detailed fact-check report.

Extracted Text:
"${extractedText}"

Please provide:
1. **Claims Identified**: List all factual claims made in the text
2. **Verification Status**: For each claim, indicate if it's TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIABLE
3. **Evidence**: Provide brief reasoning or context for each verification
4. **Overall Assessment**: Give a summary of the factual accuracy
5. **Confidence Level**: Rate your confidence in the fact-check (High/Medium/Low)

Format your response in a clear, structured way.`;

    const response = await geminiClient.generateContent(factCheckPrompt);
    
    window.currentAIResponse = {
      task: 'fact-check',
      input: { extractedText, timestamp: new Date().toISOString() },
      response: response.text,
      timestamp: new Date().toISOString()
    };
    
    const formattedResponse = formatFactCheckResponse(response.text);
    
    responseContainer.innerHTML = `
      <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid #ff6b6b; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 16px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #ffe0e0;">
          <span style="font-size: 32px;">🔍</span>
          <strong style="color: #ff6b6b; font-size: 24px;">Fact Check Results</strong>
        </div>
        <div style="color: #333; line-height: 1.8;">${formattedResponse}</div>
      </div>
      <div style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 8px; border-left: 4px solid #4caf50;">
        <strong style="color: #2e7d32; font-size: 16px;">💾 Response saved to JSON</strong>
        <div style="margin-top: 12px;">
          <button onclick="saveCaptureJSON()" style="padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Download Full Report (JSON)</button>
        </div>
      </div>
    `;
    
    console.log('✅ Fact-check complete');
  } catch (error) {
    console.error('❌ Fact-check error:', error);
    responseContainer.innerHTML = `
      <div style="color: #ff4444; padding: 16px; background: #ffebee; border-radius: 8px; margin-top: 16px;">
        <strong>⚠️ Fact-Check Error:</strong><br><br>${error.message}
      </div>
    `;
  }
}

window.copyExtractedText = function() {
  if (window.currentCapture && window.currentCapture.extractedText) {
    navigator.clipboard.writeText(window.currentCapture.extractedText)
      .then(() => alert('✅ Text copied!'))
      .catch(err => console.error('Copy failed:', err));
  }
};

window.saveCaptureJSON = function() {
  if (!window.currentCapture) {
    alert('No capture data');
    return;
  }
  
  const fullData = {
    capture: {
      extractedText: window.currentCapture.extractedText,
      timestamp: window.currentCapture.timestamp
    },
    aiAnalysis: window.currentAIResponse || null
  };
  
  const jsonData = JSON.stringify(fullData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `camera-fact-check-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Report saved!');
};

console.log('📷 Camera handler loaded');

