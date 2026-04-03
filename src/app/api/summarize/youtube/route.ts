import { NextResponse } from 'next/server';
import { generateSummary } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';
import { youtubeSummarizerSchema } from '@/lib/schemas';

// Inline video ID extractor — no dependency on transcript.ts
function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:[?&]v=)([a-zA-Z0-9_-]{11})/,
    /(?:embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

// Guaranteed fallback: fetch video title + description from YouTube Data API
async function fetchVideoMetadata(videoId: string): Promise<string | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error('[Route] YOUTUBE_API_KEY is not set in environment variables!');
    return null;
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${key}`
    );
    if (!res.ok) {
      console.error(`[Route] Data API responded with status ${res.status}`);
      return null;
    }
    const json = await res.json();
    const snippet = json?.items?.[0]?.snippet;
    if (!snippet?.title) return null;
    return [
      `⚠️ Note: The transcript for this video could not be retrieved automatically.`,
      `The summary below is based on the video's title and description.`,
      ``,
      `VIDEO TITLE: ${snippet.title}`,
      ``,
      `VIDEO DESCRIPTION:`,
      snippet.description ?? 'No description available.',
    ].join('\n');
  } catch (e) {
    console.error('[Route] Data API fetch error:', e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const result = youtubeSummarizerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { url, mode } = result.data;
    const videoId = extractVideoId(url);

    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Please provide a valid YouTube link.' }, { status: 400 });
    }

    // ── STEP 1: Try transcript extraction ──────────────────────────────────
    let content: string | null = null;

    try {
      const { extractYoutubeTranscript } = await import('@/lib/youtube/transcript');
      content = await extractYoutubeTranscript(url);
      console.log('[Route] ✅ Transcript extracted successfully');
    } catch (transcriptError) {
      console.warn('[Route] ⚠️ Transcript extraction failed, using Data API fallback:', transcriptError);
    }

    // ── STEP 2: If transcript failed, fall back to Data API ────────────────
    if (!content) {
      console.log('[Route] Attempting YouTube Data API fallback...');
      content = await fetchVideoMetadata(videoId);
    }

    // ── STEP 3: If everything failed, return a clear user-friendly error ───
    if (!content) {
      return NextResponse.json({
        error: 'Could not retrieve content for this video. Please check that YOUTUBE_API_KEY is set in Vercel environment variables and redeploy.',
      }, { status: 500 });
    }

    // ── STEP 4: Truncate and summarize ─────────────────────────────────────
    const maxChars = 4000;
    const safeContent = content.length > maxChars
      ? content.substring(0, maxChars) + '\n... [Content truncated]'
      : content;

    const summary = await generateSummary(safeContent, mode);

    // ── STEP 5: Log to database ────────────────────────────────────────────
    const { error: dbError } = await supabase.from('summaries').insert({
      user_id: user.id,
      type: 'youtube',
      mode: mode,
      title: 'YouTube Summary',
      original_input: url,
      summary_content: summary,
    });

    if (dbError) {
      console.error('[Route] Database log error:', dbError);
    }

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('[Route] Unexpected error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }, { status: 500 });
  }
}
