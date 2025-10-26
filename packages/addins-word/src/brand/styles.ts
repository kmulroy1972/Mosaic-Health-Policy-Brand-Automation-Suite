import type { RequirementSet } from '../types';

export interface WordStyleDefinition {
  paragraphs: string[];
  characters: string[];
}

const STYLE_MAP: Record<RequirementSet, WordStyleDefinition> = {
  'WordApi1.3': {
    paragraphs: ['MHP Title', 'MHP Heading 1', 'MHP Heading 2', 'MHP Body'],
    characters: ['MHP Emphasis', 'MHP Accent']
  },
  'WordApi1.5': {
    paragraphs: [
      'MHP Title',
      'MHP Heading 1',
      'MHP Heading 2',
      'MHP Heading 3',
      'MHP Body',
      'MHP Caption'
    ],
    characters: ['MHP Emphasis', 'MHP Accent', 'MHP Strong']
  },
  'WordApi1.7': {
    paragraphs: [
      'MHP Title',
      'MHP Heading 1',
      'MHP Heading 2',
      'MHP Heading 3',
      'MHP Heading 4',
      'MHP Body',
      'MHP Caption',
      'MHP Quote'
    ],
    characters: ['MHP Emphasis', 'MHP Accent', 'MHP Strong', 'MHP Small Caps']
  }
};

export function getAllowedStyles(requirementSet: RequirementSet): WordStyleDefinition {
  return STYLE_MAP[requirementSet];
}
