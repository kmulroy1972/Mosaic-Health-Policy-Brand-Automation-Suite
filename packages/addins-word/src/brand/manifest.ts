import 'office-js';

import type { BrandManifest } from '../types';
import { createTimestamp } from '../utils/date';

const CUSTOM_PROPERTY_NAME = 'MHP_BRAND_APPLIED';

export function buildManifest(version: string): BrandManifest {
  return {
    version,
    appliedAt: createTimestamp()
  };
}

export async function writeBrandManifest(document: Word.Document, manifest: BrandManifest) {
  const properties = document.properties;
  const customProperties = properties.customProperties;
  const existing = customProperties.getItemOrNullObject(CUSTOM_PROPERTY_NAME);
  existing.load('isNullObject');
  await document.context.sync();

  if (!existing.isNullObject) {
    existing.value = JSON.stringify(manifest);
  } else {
    customProperties.add(CUSTOM_PROPERTY_NAME, JSON.stringify(manifest));
  }
}

export async function readBrandManifest(document: Word.Document): Promise<BrandManifest | null> {
  const customProperties = document.properties.customProperties;
  const property = customProperties.getItemOrNullObject(CUSTOM_PROPERTY_NAME);
  property.load(['isNullObject', 'value']);
  await document.context.sync();

  if (property.isNullObject) {
    return null;
  }

  try {
    return JSON.parse(property.value as string) as BrandManifest;
  } catch {
    return null;
  }
}
