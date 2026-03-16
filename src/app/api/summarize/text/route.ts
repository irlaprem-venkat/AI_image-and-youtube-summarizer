import { NextResponse } from 'next/server';
import { generateSummary } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';
import { textSummarizerSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const result = textSummarizerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { text, mode } = result.data;

    // Truncate context if needed to respect Groq free limits
    const maxChars = 4000;
    const safeText = text.length > maxChars 
      ? text.substring(0, maxChars) + "... [Content truncated]"
      : text;

    // Generate the summary using Groq
    const summary = await generateSummary(safeText, mode);

    // Securely log to database (RLS will handle ownership via user_id)
    const { error: dbError } = await supabase.from('summaries').insert({
      user_id: user.id,
      type: 'text',
      mode: mode,
      title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      original_input: text,
      summary_content: summary,
    });

    if (dbError) {
      console.error("Database log error:", dbError);
    }

    return NextResponse.json({ summary });

  } catch (error) {
    console.error("Text Summarizer API Route Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred." 
    }, { status: 500 });
  }
}
