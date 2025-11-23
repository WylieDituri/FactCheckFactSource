from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Allow CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscriptRequest(BaseModel):
    video_id: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "FactFinder Agent Server Running"}

@app.post("/transcript")
def get_transcript(request: TranscriptRequest):
    try:
        # Fetch transcript (defaults to English)
        # Based on docs: instantiate and call fetch
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(request.video_id)
        return {"transcript": transcript}
    except Exception as e:
        print(f"Error fetching transcript: {e}")
        raise HTTPException(status_code=400, detail=str(e))

def main():
    print("🚀 Starting FactFinder Agent Server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)

if __name__ == "__main__":
    main()
