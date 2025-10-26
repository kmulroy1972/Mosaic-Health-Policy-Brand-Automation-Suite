import { createContext, useContext } from 'react';

import type { BrandContext } from '../types';

const defaultContext: BrandContext = {
  requirementSet: 'WordApi1.3',
  styles: {
    name: 'mhp-default',
    paragraphs: ['MHP Title', 'MHP Heading 1', 'MHP Body'],
    characters: ['MHP Emphasis']
  },
  hasOrgAssets: true
};

export const BrandReactContext = createContext<BrandContext>(defaultContext);

export function useBrandContext(): BrandContext {
  return useContext(BrandReactContext);
}
