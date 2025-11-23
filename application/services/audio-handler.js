// Service to handle audio recording
// In the future, this will interface with a local Python server or ONNX runtime
// for Whisper transcription.

class AudioHandler {
    constructor() {
        this.isRecording = false;
    }

    start() {
        this.isRecording = true;
        console.log('Audio Handler: Started');
        // TODO: Implement actual audio stream capture
    }

    stop() {
        this.isRecording = false;
        console.log('Audio Handler: Stopped');
        // TODO: Return audio buffer or transcription
        return "Mock Transcription";
    }
}

module.exports = new AudioHandler();
