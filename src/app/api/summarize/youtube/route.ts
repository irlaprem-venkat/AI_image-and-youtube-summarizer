import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import { youtubeSummarizerSchema } from '@/lib/schemas';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/** Fetch video title + description from YouTube Data API v3 */
async function fetchVideoDetails(videoId: string): Promise<string | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error('[YouTube] YOUTUBE_API_KEY env var is missing!');
    return null;
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${key}`,
      { next: { revalidate: 0 } }           // never cache this fetch
    );
    if (!res.ok) {
      console.error(`[YouTube] Data API error: ${res.status} ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    const snippet = json?.items?.[0]?.snippet;
    if (!snippet?.title) {
      console.error('[YouTube] Data API returned no items for videoId:', videoId);
      return null;
    }
    return (
      `VIDEO TITLE: ${snippet.title}\n\n` +
      `CHANNEL: ${snippet.channelTitle ?? 'Unknown'}\n\n` +
      `VIDEO DESCRIPTION:\n${snippet.description ?? 'No description.'}`
    );
  } catch (e) {
    console.error('[YouTube] fetchVideoDetails exception:', e);
    return null;
  }
}

/** Summarize content using Groq */
async function summarize(content: string, mode: string): Promise<string> {
  const prompts: Record<string, string> = {
    tldr: 'You are a world-class summarizer. Provide a concise 2-3 paragraph TL;DR summary. No filler text.',
    bullet: 'Extract the most important points and present them as a clear bullet-point list with bold key terms.',
    study: 'Convert the text into comprehensive study notes with headings (##), key concepts, and examples.',
    blog: 'Rewrite the core messages as an engaging, well-structured blog post with a catchy title.',
    actions: 'Extract only actionable next steps and recommendations as a to-do list.',
  };
  const systemPrompt = prompts[mode] ?? prompts.tldr;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please summarize the following:\n\n${content}` },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 1000,
  });
  return response.choices[0]?.message?.content ?? '';
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Validate input
    const body = await req.json();
    const result = youtubeSummarizerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { url, mode } = result.data;

    // 3. Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Please provide a valid YouTube link.' }, { status: 400 });
    }

    console.log(`[YouTube Route] Processing videoId: ${videoId}`);

    // 4. Get video content — YouTube Data API (guaranteed to work)
    const videoContent = await fetchVideoDetails(videoId);
    if (!videoContent) {
      return NextResponse.json({
        error: 'Could not fetch video details. Please verify that your YOUTUBE_API_KEY is correctly set in Vercel Environment Variables.',
      }, { status: 500 });
    }

    console.log(`[YouTube Route] Got video details, generating summary...`);

    // 5. Truncate content
    const maxChars = 4000;
    const safeContent = videoContent.length > maxChars
      ? videoContent.substring(0, maxChars) + '\n... [truncated]'
      : videoContent;

    // 6. Generate summary
    const summary = await summarize(safeContent, mode);

    // 7. Log to DB
    const { error: dbError } = await supabase.from('summaries').insert({
      user_id: user.id,
      type: 'youtube',
      mode,
      title: 'YouTube Summary',
      original_input: url,
      summary_content: summary,
    });
    if (dbError) console.error('[YouTube Route] DB log error:', dbError);

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('[YouTube Route] Unexpected error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }, { status: 500 });
  }
}
