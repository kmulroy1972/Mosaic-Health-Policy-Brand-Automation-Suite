import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

const SAMPLES_DIR = path.resolve(__dirname, 'samples');
const REPORT_DIR = path.resolve(process.cwd(), 'coverage/veraPDF');

interface ValidationResult {
  file: string;
  passed: boolean;
  reportPath: string;
}

function runVeraPdf(samplePath: string): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const reportName = `${path.basename(samplePath)}.xml`;
    const reportPath = path.join(REPORT_DIR, reportName);
    fs.mkdirSync(REPORT_DIR, { recursive: true });

    const dockerArgs = [
      'run',
      '--rm',
      '-v',
      `${path.dirname(samplePath)}:/workspace:ro`,
      '-v',
      `${REPORT_DIR}:/reports`,
      'verapdf/verapdf',
      '-f',
      samplePath.endsWith('.pdfa.pdf') ? '2b' : '1b',
      '-w',
      '/reports',
      path.basename(samplePath)
    ];

    const child = execFile('docker', dockerArgs, (error, stdout) => {
      if (error) {
        reject(new Error(`veraPDF failed for ${samplePath}: ${stdout}`));
        return;
      }
      const passed = stdout.includes('isCompliant="true"');
      resolve({ file: samplePath, passed, reportPath });
    });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}

async function main() {
  if (!fs.existsSync(SAMPLES_DIR)) {
    console.warn('[pdf] No samples found, skipping validation');
    return;
  }

  const files = fs.readdirSync(SAMPLES_DIR).filter((file) => file.endsWith('.pdf'));
  if (files.length === 0) {
    console.warn('[pdf] No PDF samples found, skipping validation');
    return;
  }

  const results: ValidationResult[] = [];
  for (const file of files) {
    const samplePath = path.join(SAMPLES_DIR, file);
     
    console.log(`[pdf] Validating ${file}`);
    results.push(await runVeraPdf(samplePath));
  }

  const failures = results.filter((result) => !result.passed);
  if (failures.length > 0) {
    throw new Error(`PDF validation failed for ${failures.map((f) => f.file).join(', ')}`);
  }

   
  console.log('[pdf] All PDF samples passed veraPDF validation');
}

main().catch((error) => {
   
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
