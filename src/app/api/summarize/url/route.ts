import { NextResponse } from 'next/server';
import { extractUrlContent } from '@/lib/scraper/utils';
import { generateSummary, SummaryMode } from '@/lib/ai/groq';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, mode } = body as { url: string; mode: SummaryMode };

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // 1. Fetch & parse HTML content
    console.log(`Scraping content for ${url}...`);
    const { title, text } = await extractUrlContent(url);
    
    // 2. Truncate context if needed to respect Groq free limits (4000 chars)
    const maxChars = 4000;
    const safeText = text.length > maxChars 
      ? text.substring(0, maxChars) + "... [Content truncated due to length constraint]"
      : text;

    // 3. Generate the summary using Groq
    console.log(`Generating summary using mode: ${mode}...`);
    const summary = await generateSummary(safeText, mode || 'tldr');

    // Return the summary and the extracted title
    return NextResponse.json({ summary, title });

  } catch (error) {
    console.error("URL Summarizer API Route Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
