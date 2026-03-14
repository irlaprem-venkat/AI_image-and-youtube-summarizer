import { NextResponse } from 'next/server';
import { extractYoutubeTranscript } from '@/lib/youtube/transcript';
import { generateSummary, SummaryMode } from '@/lib/ai/groq';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, mode } = body as { url: string; mode: SummaryMode };

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // 1. Extract the transcript
    console.log(`Extracting transcript for ${url}...`);
    const transcript = await extractYoutubeTranscript(url);
    
    // 2. Truncate to roughly 2500 chars (approx 500-1000 tokens) to guarantee safety
    const maxChars = 2500; 
    const safeTranscript = transcript.length > maxChars 
      ? transcript.substring(0, maxChars) + "... [Transcript truncated due to API token limits]"
      : transcript;

    // 3. Generate the summary using Groq
    console.log(`Generating summary using mode: ${mode}...`);
    const summary = await generateSummary(safeTranscript, mode || 'tldr');

    // Return the summary
    return NextResponse.json({ summary });

  } catch (error) {
    console.error("YouTube API Route Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
