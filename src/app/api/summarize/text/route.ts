import { NextResponse } from 'next/server';
import { generateSummary, SummaryMode } from '@/lib/ai/groq';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, mode } = body as { text: string; mode: SummaryMode };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    if (text.length < 50) {
      return NextResponse.json({ error: 'Text is too short to summarize. Please provide at least a few sentences.' }, { status: 400 });
    }

    // Truncate context if needed to respect Groq free limits
    const maxChars = 4000;
    const safeText = text.length > maxChars 
      ? text.substring(0, maxChars) + "... [Content truncated due to length constraint]"
      : text;

    // Generate the summary using Groq
    console.log(`Generating summary for text using mode: ${mode}...`);
    const summary = await generateSummary(safeText, mode || 'tldr');

    // Return the summary
    return NextResponse.json({ summary });

  } catch (error) {
    console.error("Text Summarizer API Route Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
