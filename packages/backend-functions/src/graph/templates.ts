import type { TemplateItem } from '../templates/types';

interface CachedTemplates {
  items: TemplateItem[];
  fetchedAt: number;
  deltaToken?: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: CachedTemplates | null = null;

async function fetchFromGraph(): Promise<{ items: TemplateItem[]; deltaToken?: string }> {
  // TODO: Integrate Microsoft Graph delta queries and $batch usage.
  // Placeholder returns static items for now.
  return {
    items: [
      {
        id: 'template-1',
        name: 'MHP Word Report',
        type: 'dotx',
        thumbnailUrl: 'https://contoso.sharepoint.com/thumbnails/template-1.png',
        driveId: 'drive-1',
        itemId: 'item-1',
        etag: 'etag-1'
      },
      {
        id: 'template-2',
        name: 'MHP Presentation',
        type: 'potx',
        thumbnailUrl: 'https://contoso.sharepoint.com/thumbnails/template-2.png',
        driveId: 'drive-2',
        itemId: 'item-2',
        etag: 'etag-2'
      }
    ],
    deltaToken: 'delta-token-placeholder'
  };
}

export async function getTemplatesFromGraph(): Promise<TemplateItem[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const result = await fetchFromGraph();
  cache = {
    items: result.items,
    fetchedAt: now,
    deltaToken: result.deltaToken
  };

  return result.items;
}
