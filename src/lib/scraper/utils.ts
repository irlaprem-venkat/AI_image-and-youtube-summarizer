import * as cheerio from 'cheerio';

export async function extractUrlContent(url: string): Promise<{ title: string; text: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, and other non-content tags to clean up the text
    $('script, style, noscript, iframe, svg, nav, footer, header, aside').remove();

    const title = $('title').text() || $('h1').first().text() || 'Unknown Title';
    
    // Attempt to target primary article content if standard tags exist
    let contentNode = $('article');
    if (contentNode.length === 0) {
      // Fallback to main or body
      contentNode = $('main').length > 0 ? $('main') : $('body');
    }

    // Extract text and clean up whitespace
    let text = contentNode.text();
    text = text.replace(/\s+/g, ' ').trim();

    if (!text || text.length < 50) {
      throw new Error("Could not extract meaningful content from this URL. It might be heavily client-side rendered or blocked.");
    }

    return { title, text };

  } catch (error) {
    console.error("URL Extraction Error:", error);
    if (error instanceof Error) {
      throw new Error(`Extraction failed: ${error.message}`);
    }
    throw new Error("Failed to extract content from the URL");
  }
}
