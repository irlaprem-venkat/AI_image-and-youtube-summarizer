import Tesseract from 'tesseract.js';

export async function extractTextFromImage(imageUrl: string | Buffer): Promise<string> {
  try {
    console.log("Starting OCR on image...");
    
    // We use the worker to process the image. 
    // In a real high-throughput production environment, we'd use Google Cloud Vision or AWS Textract,
    // but Tesseract.js works well for a self-contained Node.js extraction.
    
    const worker = await Tesseract.createWorker('eng');
    
    const { data: { text } } = await worker.recognize(imageUrl);
    
    await worker.terminate();

    const cleanText = text.replace(/\s+/g, ' ').trim();

    if (!cleanText || cleanText.length < 5) {
      throw new Error("No readable text found in the image.");
    }

    return cleanText;

  } catch (error) {
    console.error("OCR Extraction Error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
    throw new Error("Failed to extract text from image due to an unknown OCR error.");
  }
}
