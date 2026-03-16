import { NextResponse } from 'next/server';
import { extractUrlContent } from '@/lib/scraper/utils';
import { generateSummary } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';
import { urlSummarizerSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const result = urlSummarizerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { url, mode } = result.data;

    // 1. Fetch & parse HTML content
    const { title, text } = await extractUrlContent(url);
    
    // 2. Truncate context if needed to respect Groq free limits (4000 chars)
    const maxChars = 4000;
    const safeText = text.length > maxChars 
      ? text.substring(0, maxChars) + "... [Content truncated]"
      : text;

    // 3. Generate the summary using Groq
    const summary = await generateSummary(safeText, mode);

    // 4. Securely log to database
    const { error: dbError } = await supabase.from('summaries').insert({
      user_id: user.id,
      type: 'url',
      mode: mode,
      title: title || url,
      original_input: url,
      summary_content: summary,
    });

    if (dbError) {
      console.error("Database log error:", dbError);
    }

    return NextResponse.json({ summary, title });

  } catch (error) {
    console.error("URL Summarizer API Route Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred." 
    }, { status: 500 });
  }
}
