export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'fetch-metadata') {
      fetchMetadata(message.url)
        .then((data) => sendResponse(data))
        .catch(() => sendResponse({ error: true, url: message.url }));
      return true;
    }
  });
});

async function fetchMetadata(
  url: string,
): Promise<{
  title: string;
  description: string;
  image: string;
  favicon: string;
  url: string;
  error?: boolean;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const html = await response.text();
    clearTimeout(timeoutId);

    const origin = new URL(url).origin;

    const title = extractMeta(html, 'og:title') || extractTitle(html) || '';
    const description =
      extractMeta(html, 'og:description') ||
      extractNameMeta(html, 'description') ||
      '';
    const image = extractMeta(html, 'og:image') || '';
    const favicon = extractFavicon(html, origin);

    return { title, description, image, favicon, url };
  } catch {
    clearTimeout(timeoutId);
    return { title: '', description: '', image: '', favicon: '', url, error: true };
  }
}

function extractMeta(html: string, property: string): string {
  const regex = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const match = html.match(regex);
  if (match) return match[1];

  const altRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    'i',
  );
  const altMatch = html.match(altRegex);
  return altMatch ? altMatch[1] : '';
}

function extractNameMeta(html: string, name: string): string {
  const regex = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const match = html.match(regex);
  if (match) return match[1];

  const altRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
    'i',
  );
  const altMatch = html.match(altRegex);
  return altMatch ? altMatch[1] : '';
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractFavicon(html: string, origin: string): string {
  const match = html.match(
    /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i,
  );
  if (match) {
    const href = match[1];
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/')) return `${origin}${href}`;
    return `${origin}/${href}`;
  }
  return `${origin}/favicon.ico`;
}
