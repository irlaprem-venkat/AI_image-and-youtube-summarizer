import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Robust YouTube Transcript Extraction
 * Uses youtube-transcript library as primary, with a custom InnerTube scraper fallback.
 */
export async function extractYoutubeTranscript(url: string): Promise<string> {
    const videoId = extractVideoId(url) || url;
    console.log(`[YouTube] Starting robust extraction for videoId: ${videoId}`);

    // Track original error to provide meaningful feedback if everything fails
    let lastError: string = "Unknown error";

    // 1. Try primary library first
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcript && transcript.length > 0) {
            console.log(`[YouTube] Library success (${transcript.length} segments)`);
            return transcript.map(t => t.text).join(' ');
        }
    } catch (libraryError: unknown) {
        const message = libraryError instanceof Error ? libraryError.message : String(libraryError);
        console.warn(`[YouTube] Library failed: ${message}`);
        lastError = message;
    }

    // 2. Manual Scraper (Extracting from ytInitialPlayerResponse)
    try {
        console.log(`[YouTube] Attempting manual scraping fallback...`);
        const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        if (!videoPageResponse.ok) {
            throw new Error(`YouTube page fetch failed (Status: ${videoPageResponse.status})`);
        }

        const html = await videoPageResponse.text();

        // Strategy A: InnerTube get_transcript endpoint
        const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
        const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

        const visitorDataMatch = html.match(/"VISITOR_DATA":"([^"]+)"/);
        const visitorData = visitorDataMatch ? visitorDataMatch[1] : null;

        const paramsMatch = html.match(/"getTranscriptEndpoint":\s*{\s*"params":\s*"([^"]+)"/);
        const transcriptParams = paramsMatch ? paramsMatch[1] : null;

        if (apiKey && transcriptParams) {
            try {
                console.log(`[YouTube] Attempting v1/get_transcript API...`);
                const transcriptResponse = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                        'X-Youtube-Client-Name': '1',
                        'X-Youtube-Client-Version': '2.20240308.00.00',
                        'X-Goog-Visitor-Id': visitorData || '',
                        'Origin': 'https://www.youtube.com',
                        'Referer': `https://www.youtube.com/watch?v=${videoId}`,
                    },
                    body: JSON.stringify({
                        context: {
                            client: { clientName: "WEB", clientVersion: "2.20240308.00.00", platform: "DESKTOP", visitorData: visitorData || undefined }
                        },
                        params: transcriptParams
                    })
                });

                if (transcriptResponse.ok) {
                    const data = await transcriptResponse.json();
                    const segments = data?.actions?.[0]?.updateTranscriptAction?.transcript?.transcriptRenderer?.content?.transcriptBodyRenderer?.cueGroups;
                    if (segments && segments.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const fullText = (segments as any[])
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .map((g: any) => g.transcriptCueGroupRenderer?.cues?.[0]?.transcriptCueRenderer?.formattedSnippet?.simpleText || '')
                            .join(' ');
                        if (fullText.trim().length > 0) {
                            console.log(`[YouTube] Manual scraping success!`);
                            return fullText;
                        }
                    }
                }
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                console.warn(`[YouTube] v1/get_transcript internal error: ${message}`);
                lastError = message;
            }
        }
    } catch (fallbackError: unknown) {
        const message = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.warn(`[YouTube] Manual scraper failed: ${message}`);
        lastError = message;
    }

    // 3. Definitive Fallback: YouTube Data API (Video Details)
    // If we reach here, it means we couldn't get the transcript segments.
    // We will use the Title and Description so the user still gets a summary.
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
        try {
            console.log(`[YouTube] Falling back to Data API for video metadata...`);
            const apiResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${youtubeApiKey}`);
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                const snippet = data.items?.[0]?.snippet;
                if (snippet) {
                    console.log(`[YouTube] Data API success! Providing video details for summary.`);
                    return `NOTE: Full transcript was not directly accessible. Summarizing based on video details:\n\nVIDEO TITLE: ${snippet.title}\n\nVIDEO DESCRIPTION: ${snippet.description}`;
                }
            }
        } catch (apiError: unknown) {
            const message = apiError instanceof Error ? apiError.message : String(apiError);
            console.error(`[YouTube] Data API fallback failed: ${message}`);
        }
    }

    // FINAL ERROR: If even the Data API didn't work
    throw new Error(`Transcript extraction failed for ${videoId}. Error: ${lastError}. This often happens with restricted videos or bot protection on serverless environments.`);
}

export function extractVideoId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
