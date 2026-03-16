import { NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/ocr/tesseract';
import { generateSummary } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';
import { summaryModeSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const modeInput = formData.get('mode') as string || 'tldr';
    
    const modeResult = summaryModeSchema.safeParse(modeInput);
    const mode = modeResult.success ? modeResult.data : 'tldr';

    if (!imageFile) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Run OCR
    const extractedText = await extractTextFromImage(buffer);
    
    // 2. Truncate
    const maxChars = 4000;
    const safeText = extractedText.length > maxChars 
      ? extractedText.substring(0, maxChars) + "... [Content truncated]"
      : extractedText;

    // 3. Generate the summary
    const summary = await generateSummary(safeText, mode);

    // 4. Securely log to database
    const { error: dbError } = await supabase.from('summaries').insert({
      user_id: user.id,
      type: 'image',
      mode: mode,
      title: 'Image Summary',
      original_input: 'Uploaded Image',
      summary_content: summary,
    });

    if (dbError) {
      console.error("Database log error:", dbError);
    }

    return NextResponse.json({ summary, extractedText: safeText });

  } catch (error) {
    console.error("Image Summarizer API Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred." 
    }, { status: 500 });
  }
}
