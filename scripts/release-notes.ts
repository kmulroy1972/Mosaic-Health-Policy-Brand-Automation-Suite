#!/usr/bin/env ts-node

/**
 * Generate release notes from git commits and changesets
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

function getCommitsSince(tag?: string): Commit[] {
  const range = tag ? `${tag}..HEAD` : 'HEAD~20';
  const log = execSync(`git log --pretty=format:"%h|%an|%ad|%s" --date=iso ${range}`, {
    encoding: 'utf-8'
  });

  return log
    .trim()
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => {
      const [hash, author, date, ...messageParts] = line.split('|');
      return {
        hash: hash || '',
        author: author || '',
        date: date || '',
        message: messageParts.join('|')
      };
    });
}

function generateReleaseNotes(version: string): string {
  const commits = getCommitsSince();
  const lastTag = getLastTag();

  let notes = `# Release Notes - ${version}\n\n`;
  notes += `**Date:** ${new Date().toISOString()}\n`;
  notes += `**Previous Version:** ${lastTag || 'N/A'}\n\n`;

  notes += `## Changes\n\n`;

  // Group commits by type
  const features: Commit[] = [];
  const fixes: Commit[] = [];
  const docs: Commit[] = [];
  const other: Commit[] = [];

  commits.forEach((commit) => {
    const msg = commit.message.toLowerCase();
    if (msg.includes('fix') || msg.includes('bug')) {
      fixes.push(commit);
    } else if (msg.includes('feat') || msg.includes('add') || msg.includes('implement')) {
      features.push(commit);
    } else if (msg.includes('doc')) {
      docs.push(commit);
    } else {
      other.push(commit);
    }
  });

  if (features.length > 0) {
    notes += `### ✨ Features\n\n`;
    features.forEach((commit) => {
      notes += `- ${commit.message} (${commit.hash})\n`;
    });
    notes += `\n`;
  }

  if (fixes.length > 0) {
    notes += `### 🐛 Fixes\n\n`;
    fixes.forEach((commit) => {
      notes += `- ${commit.message} (${commit.hash})\n`;
    });
    notes += `\n`;
  }

  if (docs.length > 0) {
    notes += `### 📚 Documentation\n\n`;
    docs.forEach((commit) => {
      notes += `- ${commit.message} (${commit.hash})\n`;
    });
    notes += `\n`;
  }

  notes += `## Commit Details\n\n`;
  commits.forEach((commit) => {
    notes += `- **${commit.hash}** (${commit.date}) - ${commit.message} - ${commit.author}\n`;
  });

  return notes;
}

function getCommitsSince() {
  return getCommitsSince();
}

function getLastTag(): string | null {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

// Generate release notes
const version = process.env.VERSION || '0.1.0';
const notes = generateReleaseNotes(version);
fs.writeFileSync('docs/RELEASE_NOTES.md', notes);

console.log('✅ Release notes generated: docs/RELEASE_NOTES.md');
