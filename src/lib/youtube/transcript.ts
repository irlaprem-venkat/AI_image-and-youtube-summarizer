import { YoutubeTranscript } from 'youtube-transcript';

export async function extractYoutubeTranscript(videoUrl: string): Promise<string> {
  try {
    // Basic validation
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      throw new Error("Invalid YouTube URL");
    }

    // Fetch the transcript
    const transcriptLines = await YoutubeTranscript.fetchTranscript(videoUrl);
    
    // The library returns an array of objects with 'text', 'duration', and 'offset'
    // For basic summarization, we just need to concatenate the text.
    // We clean up common artifact strings like [Music] or [Laughter] which aren't useful for summaries.
    const fullText = transcriptLines
      .map(line => line.text)
      .filter(text => !text.startsWith('[') && !text.endsWith(']')) // Naive filter for closed caption tags
      .join(' ')
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();

    if (!fullText || fullText.length < 50) {
      throw new Error("Extracted transcript is too short or empty. This video might not have captions enabled.");
    }

    return fullText;

  } catch (error) {
    console.error("Failed to extract YouTube transcript:", error);
    if (error instanceof Error) {
      throw new Error(`Transcript extraction failed: ${error.message}`);
    }
    throw new Error("Failed to extract YouTube transcript due to an unknown error.");
  }
}
