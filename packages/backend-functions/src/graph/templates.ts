import type { DriveItem, DriveDeltaResult } from '@mhp/shared-brand-core';

import type { TemplateItem } from '../templates/types';

import { getGraphClient } from './client';

interface CachedTemplates {
  items: TemplateItem[];
  fetchedAt: number;
  deltaToken?: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_TEMPLATES: TemplateItem[] = [
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
];

let cache: CachedTemplates | null = null;

function shouldUseFallback(): boolean {
  return process.env.TEMPLATE_SERVICE_STUB === 'true' || !process.env.ORG_ASSETS_DRIVE_ID;
}

function mapTemplateItem(item: DriveItem, driveId: string): TemplateItem {
  const name = item.name ?? 'Untitled template';
  const extension = name.split('.').pop()?.toLowerCase() ?? 'dotx';
  const type = extension === 'potx' ? 'potx' : 'dotx';
  const parent = (item.parentReference ?? {}) as { driveId?: string };
  const resolvedDriveId = parent.driveId ?? driveId;

  return {
    id: item.id,
    name,
    type,
    thumbnailUrl: buildThumbnailUrl(resolvedDriveId, item.id),
    driveId: resolvedDriveId,
    itemId: item.id,
    etag: String(item.eTag ?? item['@odata.etag'] ?? '')
  };
}

function buildThumbnailUrl(driveId: string, itemId: string): string {
  if (!driveId || !itemId) {
    return '';
  }
  return `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/thumbnails/0/medium/content`;
}

function applyDelta(
  delta: DriveDeltaResult<TemplateItem>,
  previous: TemplateItem[] | undefined
): TemplateItem[] {
  const next = new Map<string, TemplateItem>();
  for (const template of previous ?? []) {
    next.set(template.id, template);
  }

  for (const removedId of delta.removedIds) {
    next.delete(removedId);
  }

  for (const item of delta.items) {
    next.set(item.id, item);
  }

  return Array.from(next.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchFromGraph(): Promise<{ items: TemplateItem[]; deltaToken?: string }> {
  if (shouldUseFallback()) {
    return { items: FALLBACK_TEMPLATES, deltaToken: undefined };
  }

  const driveId = process.env.ORG_ASSETS_DRIVE_ID as string;
  const graphClient = getGraphClient();

  const delta = await graphClient.fetchDriveDelta<TemplateItem>({
    driveId,
    token: cache?.deltaToken,
    mapItem: (item) => mapTemplateItem(item, driveId)
  });

  const items = applyDelta(delta, cache?.items);
  return {
    items,
    deltaToken: delta.deltaToken
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
    deltaToken: result.deltaToken ?? cache?.deltaToken
  };

  return result.items;
}
