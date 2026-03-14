import { NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/ocr/tesseract';
import { generateSummary, SummaryMode } from '@/lib/ai/groq';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const mode = (formData.get('mode') as SummaryMode) || 'tldr';

    if (!imageFile) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Convert the File object into a Buffer for Tesseract to read
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Run OCR to extract text from the image buffer
    console.log(`Extracting text from uploaded image...`);
    const extractedText = await extractTextFromImage(buffer);
    
    // 2. Truncate if insanely long to respect limits
    const maxChars = 4000;
    const safeText = extractedText.length > maxChars 
      ? extractedText.substring(0, maxChars) + "... [Content truncated due to length constraint]"
      : extractedText;

    // 3. Generate the summary using Groq
    console.log(`Generating summary using mode: ${mode}...`);
    const summary = await generateSummary(safeText, mode);

    // Return the summary and the raw extracted text (useful for debugging/UI)
    return NextResponse.json({ summary, extractedText: safeText });

  } catch (error) {
    console.error("Image Summarizer API Route Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
