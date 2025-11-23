const { ipcRenderer } = require('electron');

// Import Clients
const FishAudioClient = require('./services/fish-audio-client');
const GeminiClient = require('./services/gemini-client');

const cardsContainer = document.getElementById('cards-container');
const statusIndicator = document.getElementById('status-indicator');

// Voice/System Audio Recording State
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioContext = null;
let analyser = null;
let silenceStart = null;
let silenceThreshold = 0.02; // Adjust based on noise level
let silenceDuration = 1000; // 1 second of silence to trigger stop
let animationFrameId = null;

// Initialize Clients
const fishAudioClient = new FishAudioClient(process.env.FISH_AUDIO_API_KEY);
const geminiClient = new GeminiClient(process.env.GOOGLE_API_KEY);

// Helper to log to both console and terminal (via main process)
function logToMain(message) {
    console.log(message);
    ipcRenderer.send('log-message', message);
}

// Toggle Recording Function (Triggered by UI or Shortcut)
async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        logToMain('Enumerating audio devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');

        logToMain(`Found ${audioInputs.length} audio inputs:`);
        audioInputs.forEach(d => logToMain(`- ${d.label} (ID: ${d.deviceId})`));

        // Try to find BlackHole or similar loopback device
        const blackHole = audioInputs.find(d => d.label.toLowerCase().includes('blackhole') || d.label.toLowerCase().includes('multi-output'));
        const deviceId = blackHole ? blackHole.deviceId : 'default';

        if (blackHole) {
            logToMain(`🎯 Found Loopback Device: ${blackHole.label}`);
        } else {
            logToMain('⚠️ No Loopback/BlackHole device found. Using Default Microphone.');
            logToMain('   (To capture system audio, install BlackHole and select it as input)');
        }

        // Capture audio from the selected device (Microphone/Loopback)
        // We NO LONGER use 'chromeMediaSource: desktop' for audio as it is unreliable on macOS without loopback
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: { exact: deviceId },
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            },
            video: false // We don't need video anymore
        });

        logToMain(`Stream captured: ${stream.id}`);
        // Audio Context for Silence Detection
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        // We only need the audio track for recording
        const audioStream = new MediaStream([stream.getAudioTracks()[0]]);
        mediaRecorder = new MediaRecorder(audioStream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                // logToMain(`Chunk received: ${event.data.size} bytes`); // Uncomment for verbose logging
            }
        };

        mediaRecorder.onstop = async () => {
            logToMain(`Recorder stopped. Chunks: ${audioChunks.length}`);
            if (audioChunks.length === 0) {
                logToMain('⚠️ No audio data collected. Did you play any sound?');
                return;
            }

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            logToMain(`🎤 Audio recorded: ${(audioBlob.size / 1024).toFixed(2)} KB`);

            // Send to Fish Audio
            await processAudio(audioBlob);

            audioChunks = [];

            if (isRecording) {
                logToMain('Restarting recording...');
                startRecording();
            }
        };

        mediaRecorder.start();
        isRecording = true;
        statusIndicator.style.display = 'flex';
        statusIndicator.querySelector('.status-text').textContent = 'Listening...';
        logToMain('🔴 System Audio Recording Started');

        // Start Silence Detection Loop
        detectSilence();

    } catch (error) {
        console.error('Error starting system audio recording:', error);
        logToMain(`Error starting recording: ${error.message}`);
        alert('Failed to capture system audio. Please check permissions.');
    }
}

function detectSilence() {
    if (!isRecording || !analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const volume = average / 255; // Normalize to 0-1

    // logToMain(`Volume: ${volume.toFixed(4)}`); // Debug volume

    if (volume < silenceThreshold) {
        if (!silenceStart) {
            silenceStart = Date.now();
        } else if (Date.now() - silenceStart > silenceDuration) {
            // Silence detected for long enough
            logToMain(`Silence detected (Vol: ${volume.toFixed(4)}), processing...`);
            stopRecording(true);
            return;
        }
    } else {
        if (silenceStart) {
            // logToMain('Sound detected, resetting silence timer');
        }
        silenceStart = null;
    }

    animationFrameId = requestAnimationFrame(detectSilence);
}

function stopRecording(autoRestart = false) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    // Don't set isRecording to false if we want to auto-restart
    if (!autoRestart) {
        isRecording = false;
        statusIndicator.style.display = 'none';
        logToMain('⏹️ System Audio Recording Stopped (Manual)');
    } else {
        statusIndicator.querySelector('.status-text').textContent = 'Processing...';
        // logToMain('⏹️ System Audio Recording Stopped (Auto)');
    }

    // Stop tracks and close context ONLY if we are fully stopping
    // If auto-restarting, we might want to keep them? 
    // Actually, startRecording creates new streams, so we SHOULD stop old ones.

    if (mediaRecorder && mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => {
            try {
                track.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
        });
    }

    if (audioContext) {
        try {
            audioContext.close();
        } catch (e) { }
        audioContext = null;
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

async function processAudio(audioBlob) {
    try {
        logToMain('🐟 Sending to Fish Audio...');
        const result = await fishAudioClient.transcribe(audioBlob);
        logToMain(`✅ Transcription: ${result.text}`);

        if (result.text && result.text.trim().length > 10) {
            logToMain(`🔍 Fact checking: ${result.text}`);

            // Send to Gemini
            const factCheckPrompt = `
            You are a real-time fact checker. Analyze the following text:
            "${result.text}"
            
            If it contains a factual claim, verify it.
            Return a JSON object:
            {
                "isTrue": boolean,
                "statement": "The claim found",
                "correction": "Correction if false, or context if true",
                "source": "Source of verification"
            }
            If no factual claim is found, return null.
            `;

            const factCheckResult = await geminiClient.generateContent(factCheckPrompt);

            // Parse JSON from Gemini response (it might be wrapped in markdown)
            let jsonStr = factCheckResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const data = JSON.parse(jsonStr);
                if (data) {
                    logToMain(`💡 Fact Check Result: ${data.isTrue ? 'TRUE' : 'FALSE'} - ${data.statement}`);
                    showFactCard(data);
                } else {
                    logToMain('No factual claim found.');
                }
            } catch (e) {
                console.error('Failed to parse Gemini response:', e);
                logToMain(`Failed to parse Gemini response: ${e.message}`);
            }
        } else {
            logToMain('Transcription too short, skipping fact check.');
        }
    } catch (error) {
        console.error('Processing Error:', error);
        logToMain(`Processing Error: ${error.message}`);
    }
}

// Listen for Global Shortcut Toggle
ipcRenderer.on('toggle-recording', async (event, isRecording) => {
    console.log('Toggle Recording:', isRecording);
    toggleRecording();
});

// Function to create and show a fact card
function showFactCard(data) {
    const card = document.createElement('div');
    card.className = `fact-card ${data.isTrue ? 'true' : 'false'}`;

    card.innerHTML = `
        <div class="card-header">
            <span class="verdict ${data.isTrue ? 'true' : 'false'}">
                ${data.isTrue ? 'VERIFIED TRUE' : 'FALSE CLAIM DETECTED'}
            </span>
        </div>
        <div class="statement">"${data.statement}"</div>
        <div class="correction">${data.correction}</div>
        <div class="source">
            <div class="source-icon"></div>
            <span>Source: ${data.source}</span>
        </div>
    `;

    cardsContainer.appendChild(card);

    // Trigger animation
    requestAnimationFrame(() => {
        card.classList.add('visible');
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        card.classList.remove('visible');
        setTimeout(() => card.remove(), 600); // Wait for transition
    }, 10000);
}

// Click-Through Logic
window.addEventListener('mousemove', (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (element && element.closest('.interactive')) {
        ipcRenderer.send('set-ignore-mouse-events', false);
    } else {
        ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
    }
});
