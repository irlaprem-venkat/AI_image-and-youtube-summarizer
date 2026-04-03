/**
 * YouTube Content Extraction
 * NO dependency on the youtube-transcript library (which gets blocked on Vercel).
 * Uses YouTube Data API + InnerTube scraper only.
 */

function extractVideoIdFromUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:[?&]v=)([a-zA-Z0-9_-]{11})/,
    /(?:embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

async function tryInnerTubeScraper(videoId: string): Promise<string | null> {
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!pageRes.ok) return null;

    const html = await pageRes.text();
    const innertube = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
    const visitor   = html.match(/"VISITOR_DATA":"([^"]+)"/)?.[1];
    const params    = html.match(/"getTranscriptEndpoint":\s*\{\s*"params":\s*"([^"]+)"/)?.[1];

    if (!innertube || !params) return null;

    const tRes = await fetch(
      `https://www.youtube.com/youtubei/v1/get_transcript?key=${innertube}`,
      {
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
      }
    );

    if (!tRes.ok) return null;

    const json = await tRes.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups = json?.actions?.[0]?.updateTranscriptAction?.transcript
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.transcriptRenderer?.content?.transcriptBodyRenderer?.cueGroups as any[];

    if (!Array.isArray(groups) || groups.length === 0) return null;

    const text = groups
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((g: any) =>
        g?.transcriptCueGroupRenderer?.cues?.[0]?.transcriptCueRenderer
          ?.formattedSnippet?.simpleText ?? ''
      )
      .join(' ')
      .trim();

    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

async function fetchVideoMetadata(videoId: string): Promise<string | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error('[YouTube] YOUTUBE_API_KEY is not set!');
    return null;
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${key}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const snippet = json?.items?.[0]?.snippet;
    if (!snippet?.title) return null;

    return [
      `⚠️ Note: A full transcript was not available for this video.`,
      `This summary is based on the video title and description.`,
      ``,
      `VIDEO TITLE: ${snippet.title}`,
      ``,
      `VIDEO DESCRIPTION:`,
      snippet.description ?? 'No description available.',
    ].join('\n');
  } catch {
    return null;
  }
}

export async function extractYoutubeTranscript(url: string): Promise<string> {
  const videoId = extractVideoIdFromUrl(url);
  if (!videoId) throw new Error('Invalid YouTube URL. Could not extract video ID.');

  console.log(`[YouTube] Extracting content for: ${videoId}`);

  // Method 1: InnerTube scraper (works when not blocked)
  const scraped = await tryInnerTubeScraper(videoId);
  if (scraped) {
    console.log('[YouTube] ✅ InnerTube scraper succeeded');
    return scraped;
  }
  console.log('[YouTube] InnerTube scraper failed, trying Data API...');

  // Method 2: YouTube Data API (title + description) — always works
  const metadata = await fetchVideoMetadata(videoId);
  if (metadata) {
    console.log('[YouTube] ✅ Data API succeeded');
    return metadata;
  }

  throw new Error(
    'Could not retrieve video content. Please check that your YOUTUBE_API_KEY is correctly set in Vercel environment variables.'
  );
}

// Named export for direct use in route
export { extractVideoIdFromUrl as extractVideoId };
