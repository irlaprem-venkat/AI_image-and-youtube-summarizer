import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Normalizes a YouTube URL to a standard format for the transcript library.
 * Handles youtu.be, shorts, and URLs with tracking parameters.
 */
function normalizeYoutubeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    let videoId = '';

    if (parsedUrl.hostname === 'youtu.be') {
      videoId = parsedUrl.pathname.slice(1);
    } else if (parsedUrl.hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/shorts/')) {
        videoId = parsedUrl.pathname.split('/')[2];
      } else {
        videoId = parsedUrl.searchParams.get('v') || '';
      }
    }

    if (!videoId) return url; // Fallback to original if can't parse ID
    
    // Using a clean standard URL often helps libraries find the right metadata
    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch (e) {
    return url;
  }
}

export async function extractYoutubeTranscript(videoUrl: string): Promise<string> {
  const cleanUrl = normalizeYoutubeUrl(videoUrl);
  
  try {
    if (!cleanUrl.includes('youtube.com') && !cleanUrl.includes('youtu.be')) {
      throw new Error("Invalid YouTube URL");
    }

    // Try fetching the transcript
    // We try with auto-generated English hints if the base fetch fails
    let transcriptLines;
    try {
      transcriptLines = await YoutubeTranscript.fetchTranscript(cleanUrl);
    } catch (initialError) {
      console.warn("Initial transcript fetch failed, trying with English language hint...", initialError);
      try {
        transcriptLines = await YoutubeTranscript.fetchTranscript(cleanUrl, { lang: 'en' });
      } catch (retryError) {
        throw initialError; // Re-throw original error if retry also fails
      }
    }
    
    const fullText = transcriptLines
      .map(line => line.text)
      .filter(text => !text.startsWith('[') && !text.endsWith(']')) 
      .join(' ')
      .replace(/\s+/g, ' ') 
      .trim();

    if (!fullText || fullText.length < 50) {
      throw new Error("Extracted transcript is too short or empty. This video might not have captions enabled.");
    }

    return fullText;

  } catch (error: any) {
    console.error("Failed to extract YouTube transcript:", error);
    
    // Provide a more helpful user-facing error message
    let message = error.message;
    if (message.includes("Transcript is disabled")) {
      message = "YouTube returned a 'disabled' status for transcripts on this video. If you see captions on YouTube, try refreshing or pasting the link again. Some video regions or types are harder for automated tools to access.";
    }

    throw new Error(`Transcript extraction failed: ${message}`);
  }
}
