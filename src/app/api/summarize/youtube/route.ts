import { NextResponse } from 'next/server';
import { extractYoutubeTranscript } from '@/lib/youtube/transcript';
import { generateSummary } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';
import { youtubeSummarizerSchema } from '@/lib/schemas';

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

    // 1. Extract the transcript
    const transcript = await extractYoutubeTranscript(url);
    
    // 2. Truncate context if needed
    const maxChars = 2500; 
    const safeTranscript = transcript.length > maxChars 
      ? transcript.substring(0, maxChars) + "... [Transcript truncated]"
      : transcript;

    // 3. Generate the summary using Groq
    const summary = await generateSummary(safeTranscript, mode);

    // 4. Securely log to database
    const { error: dbError } = await supabase.from('summaries').insert({
      user_id: user.id,
      type: 'youtube',
      mode: mode,
      title: 'YouTube Summary',
      original_input: url,
      summary_content: summary,
    });

    if (dbError) {
      console.error("Database log error:", dbError);
    }

    return NextResponse.json({ summary });

  } catch (error) {
    console.error("YouTube API Route Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred." 
    }, { status: 500 });
  }
}
