import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve(process.cwd(), 'artifacts');

const TASKPANE_TARGETS = [
  {
    name: 'word',
    source: path.resolve(process.cwd(), 'packages/addins-word/dist'),
    entry: 'index.js'
  },
  {
    name: 'ppt',
    source: path.resolve(process.cwd(), 'packages/addins-ppt/dist'),
    entry: 'index.js'
  },
  {
    name: 'outlook',
    source: path.resolve(process.cwd(), 'packages/addins-outlook/dist'),
    entry: 'index.js'
  }
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function zipDirectory(source: string, destination: string) {
  ensureDir(path.dirname(destination));
  const cwd = path.dirname(source);
  const folder = path.basename(source);
  execSync(`cd ${cwd} && zip -rq ${destination} ${folder}`);
}

function packageTaskpane(target: (typeof TASKPANE_TARGETS)[number]) {
  if (!fs.existsSync(target.source)) {
    throw new Error(`Task pane build missing: ${target.source}`);
  }
  const output = path.join(OUTPUT_DIR, `${target.name}/taskpane-${target.name}.zip`);
  zipDirectory(target.source, output);
   
  console.log(`[deploy] Packaged task pane ${target.name}`);
}

function main() {
  TASKPANE_TARGETS.forEach((target) => packageTaskpane(target));
}

main();
