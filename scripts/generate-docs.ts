#!/usr/bin/env ts-node

/**
 * Automated documentation generation
 * Scans src/ and generates API_REFERENCE.md and CHANGELOG.md
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface FunctionInfo {
  name: string;
  route: string;
  methods: string[];
  file: string;
  lastModified: string;
}

function scanFunctions(dir: string, functions: FunctionInfo[] = []): FunctionInfo[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanFunctions(filePath, functions);
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const routeMatch = content.match(/route:\s*['"]([^'"]+)['"]/);
      const methodMatch = content.match(/methods:\s*\[([^\]]+)\]/);
      const handlerMatch = content.match(/handler:\s*(\w+)/);

      if (routeMatch && handlerMatch) {
        const route = routeMatch[1];
        const methods = methodMatch
          ? methodMatch[1].split(',').map((m) => m.trim().replace(/['"]/g, ''))
          : ['GET'];
        const name = handlerMatch[1];

        functions.push({
          name,
          route,
          methods,
          file: filePath,
          lastModified: stat.mtime.toISOString()
        });
      }
    }
  }

  return functions;
}

function generateApiReference(): string {
  const functions = scanFunctions('packages/backend-functions/src');
  const routes = functions.map((f) => ({
    ...f,
    relativeFile: f.file.replace(process.cwd() + '/', '')
  }));

  let md = `# API Reference

**Generated:** ${new Date().toISOString()}
**Last Deployment:** ${execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim()}

## Endpoints

| Route | Methods | Handler | File | Last Modified |
|-------|---------|---------|------|---------------|
`;

  routes.forEach((route) => {
    md += `| \`${route.route}\` | ${route.methods.join(', ')} | \`${route.name}\` | \`${route.relativeFile}\` | ${route.lastModified} |\n`;
  });

  md += `\n## Summary

Total Endpoints: ${routes.length}
Total Functions: ${new Set(routes.map((r) => r.name)).size}

## Build Metadata

- **Commit SHA:** ${execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()}
- **Branch:** ${execSync('git branch --show-current', { encoding: 'utf-8' }).trim()}
- **Last Commit:** ${execSync('git log -1 --format=%h %s', { encoding: 'utf-8' }).trim()}
`;

  return md;
}

function generateChangelog(): string {
  try {
    const log = execSync('git log --pretty=format:"%h|%ci|%s" --since="30 days ago"', {
      encoding: 'utf-8'
    });

    let md = `# Changelog

**Generated:** ${new Date().toISOString()}

## Recent Changes (Last 30 Days)

`;

    const commits = log
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => {
        const [hash, date, ...messageParts] = line.split('|');
        return {
          hash,
          date,
          message: messageParts.join('|')
        };
      });

    commits.forEach((commit) => {
      md += `- **${commit.date}** [\`${commit.hash}\`] ${commit.message}\n`;
    });

    if (commits.length === 0) {
      md += 'No commits in the last 30 days.\n';
    }

    return md;
  } catch (error) {
    return `# Changelog\n\n**Error generating changelog:** ${error}\n`;
  }
}

// Generate documentation
const apiRef = generateApiReference();
const changelog = generateChangelog();

fs.writeFileSync('docs/API_REFERENCE.md', apiRef);
fs.writeFileSync('docs/CHANGELOG.md', changelog);

console.log('✅ Documentation generated:');
console.log('  - docs/API_REFERENCE.md');
console.log('  - docs/CHANGELOG.md');
