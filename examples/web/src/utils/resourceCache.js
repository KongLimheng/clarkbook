const cache = new Map();

const IMG_SRC_RE = /<img[^>]+src=["'](https?:\/\/[^"'>\s]+)["']/gi;
const LINK_HREF_RE = /<link[^>]+href=["'](https?:\/\/[^"'>\s]+)["'][^>]*>/gi;
const CSS_URL_RE = /url\(["']?(https?:\/\/[^"')>\s]+)["']?\)/gi;

function extractUrls(html) {
  const urls = new Set();
  for (const re of [IMG_SRC_RE, LINK_HREF_RE, CSS_URL_RE]) {
    re.lastIndex = 0;
    let m = re.exec(html);
    while (m !== null) {
      if (re === LINK_HREF_RE && !/rel=["']stylesheet["']/i.test(m[0])) {
        m = re.exec(html);
        continue;
      }
      urls.add(m[1]);
      m = re.exec(html);
    }
  }
  return urls;
}

/**
 * Scans htmlString for external http/https resource URLs, fetches each one
 * (once, cached), and returns a record mapping URL → Uint8Array suitable
 * for use as clarkbook exportOptions.resources.
 *
 * @param {string} html
 * @returns {Promise<Record<string, Uint8Array>>}
 */
export async function fetchRemoteResources(html) {
  const urls = extractUrls(html);
  console.log({ urls})
  if (urls.size === 0) return {};

  await Promise.allSettled(
    [...urls].filter(url => !cache.has(url)).map(async url => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        cache.set(url, new Uint8Array(buffer));
      } catch (err) {
        console.warn(`[resourceCache] Failed to fetch: ${url}`, err);
      }
    })
  );

  const resources = {};
  for (const url of urls) {
    if (cache.has(url)) resources[url] = cache.get(url);
  }
  return resources;
}

export function clearResourceCache() {
  cache.clear();
}
