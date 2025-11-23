/**
 * YouTube Transcript Utility
 * Fetches transcripts via local Python backend
 */

/**
 * Extract Video ID from URL
 */
export function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Fetch transcript for a video
 */
export async function fetchTranscript(videoId) {
    try {
        // Call local Python backend
        const response = await fetch('http://127.0.0.1:8000/transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ video_id: videoId })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.transcript;

    } catch (error) {
        console.error('Transcript fetch error:', error);

        if (error.message.includes('Failed to fetch')) {
            throw new Error('Could not connect to local server. Please run "uv run main.py" in Agent_Folder.');
        }

        throw error;
    }
}
