/**
 * Robust YouTube Transcript Extraction
 * Priority order:
 *   1. YouTube Data API (fetches title + description — always works if key is valid)
 *   2. youtube-transcript library (works for non-restricted videos)
 *   3. InnerTube manual scraper (last resort for cloud environments)
 */
export async function extractYoutubeTranscript(url: string): Promise<string> {
    const videoId = extractVideoId(url) || url;
    console.log(`[YouTube] Starting extraction for videoId: ${videoId}`);

    const errors: string[] = [];

    // ─── METHOD 1: youtube-transcript library ────────────────────────────────
    // Try this first as it's the fastest when not blocked
    try {
        const { YoutubeTranscript } = await import('youtube-transcript');
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcript && transcript.length > 0) {
            console.log(`[YouTube] ✅ Library success (${transcript.length} segments)`);
            return transcript.map((t: { text: string }) => t.text).join(' ');
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[YouTube] ⚠️ Library failed: ${msg}`);
        errors.push(`Library: ${msg}`);
    }

    // ─── METHOD 2: InnerTube API scraper ─────────────────────────────────────
    try {
        console.log(`[YouTube] Attempting InnerTube scraper...`);
        const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });

        if (pageRes.ok) {
            const html = await pageRes.text();
            const innertube = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1] ?? null;
            const visitor = html.match(/"VISITOR_DATA":"([^"]+)"/)?.[1] ?? null;
            const params = html.match(/"getTranscriptEndpoint":\s*\{\s*"params":\s*"([^"]+)"/)?.[1] ?? null;

            if (innertube && params) {
                const tRes = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=${innertube}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'X-Youtube-Client-Name': '1',
                        'X-Youtube-Client-Version': '2.20240308.00.00',
                        'X-Goog-Visitor-Id': visitor ?? '',
                        'Origin': 'https://www.youtube.com',
                        'Referer': `https://www.youtube.com/watch?v=${videoId}`,
                    },
                    body: JSON.stringify({
                        context: {
                            client: {
                                clientName: 'WEB',
                                clientVersion: '2.20240308.00.00',
                                platform: 'DESKTOP',
                                ...(visitor ? { visitorData: visitor } : {}),
                            },
                        },
                        params,
                    }),
                });

                if (tRes.ok) {
                    const json = await tRes.json();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const groups = json?.actions?.[0]?.updateTranscriptAction?.transcript?.transcriptRenderer?.content?.transcriptBodyRenderer?.cueGroups as any[];
                    if (Array.isArray(groups) && groups.length > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const text = groups.map((g: any) =>
                            g?.transcriptCueGroupRenderer?.cues?.[0]?.transcriptCueRenderer?.formattedSnippet?.simpleText ?? ''
                        ).join(' ').trim();
                        if (text.length > 0) {
                            console.log(`[YouTube] ✅ InnerTube success (${groups.length} segments)`);
                            return text;
                        }
                    }
                }
            }
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[YouTube] ⚠️ InnerTube scraper failed: ${msg}`);
        errors.push(`InnerTube: ${msg}`);
    }

    // ─── METHOD 3: YouTube Data API (guaranteed fallback) ────────────────────
    // Even if transcript is disabled, we can still summarize from title + description.
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
        try {
            console.log(`[YouTube] Falling back to YouTube Data API...`);
            const apiRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`
            );
            if (apiRes.ok) {
                const json = await apiRes.json();
                const snippet = json?.items?.[0]?.snippet;
                if (snippet?.title) {
                    console.log(`[YouTube] ✅ Data API success — summarizing from title + description`);
                    const title = snippet.title ?? 'Unknown';
                    const description = snippet.description ?? 'No description available.';
                    return [
                        `⚠️ Note: The full transcript for this video could not be retrieved automatically.`,
                        `The summary below is based on the video's title and description.`,
                        ``,
                        `VIDEO TITLE: ${title}`,
                        ``,
                        `VIDEO DESCRIPTION:`,
                        description,
                    ].join('\n');
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[YouTube] ❌ Data API failed: ${msg}`);
            errors.push(`DataAPI: ${msg}`);
        }
    } else {
        console.warn(`[YouTube] ⚠️ YOUTUBE_API_KEY not set — skipping Data API fallback`);
        errors.push('DataAPI: YOUTUBE_API_KEY environment variable is not set');
    }

    // ─── ALL METHODS FAILED ────────────────────────────────────────────────────
    throw new Error(
        `Could not retrieve content for this YouTube video. ` +
        `This may be because the video is private, age-restricted, or has transcripts disabled. ` +
        `Please try a different video. (Details: ${errors.join(' | ')})`
    );
}

export function extractVideoId(url: string): string | null {
    if (!url) return null;
    // Handle youtu.be short links, full watch URLs, embed URLs, and plain IDs
    const patterns = [
        /(?:youtu\.be\/)([^#&?]{11})/,
        /(?:v=)([^#&?]{11})/,
        /(?:embed\/)([^#&?]{11})/,
        /(?:shorts\/)([^#&?]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    // If it looks like a raw 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
}
