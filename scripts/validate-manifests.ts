import fs from 'fs';
import path from 'path';
import process from 'process';

import Ajv, { ErrorObject } from 'ajv';

const manifestSchema = {
  $id: 'https://mhp-brand-automation/manifest.schema.json',
  type: 'object',
  required: [
    'manifestVersion',
    'version',
    'id',
    'displayName',
    'description',
    'webApplicationInfo',
    'extensions'
  ],
  properties: {
    manifestVersion: { type: 'string' },
    version: { type: 'string' },
    id: { type: 'string', minLength: 1 },
    displayName: { type: 'object' },
    description: { type: 'object' },
    webApplicationInfo: {
      type: 'object',
      required: ['id', 'resource'],
      properties: {
        id: { type: 'string', minLength: 1 },
        resource: { type: 'string', minLength: 1 }
      }
    },
    extensions: {
      type: 'array',
      minItems: 1
    }
  }
};

const manifests = [
  'manifest/unified.dev.json',
  'manifest/unified.test.json',
  'manifest/unified.prod.json'
];

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(manifestSchema);

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) {
    return 'Unknown validation error';
  }

  return errors
    .map((error) => {
      const instance = error.instancePath || '(root)';
      return `${instance} ${error.message ?? ''}`.trim();
    })
    .join('\n');
}

let hasErrors = false;

for (const manifestRelPath of manifests) {
  const manifestPath = path.resolve(process.cwd(), manifestRelPath);
  if (!fs.existsSync(manifestPath)) {
    console.error(`Missing manifest: ${manifestRelPath}`);
    hasErrors = true;
    continue;
  }

  const raw = fs.readFileSync(manifestPath, 'utf-8');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    console.error(`Invalid JSON in ${manifestRelPath}: ${(error as Error).message}`);
    hasErrors = true;
    continue;
  }

  const valid = validate(json);
  if (!valid) {
    const msg = formatErrors(validate.errors);
    console.error(`Schema validation failed for ${manifestRelPath}:\n${msg}`);
    hasErrors = true;
  } else {
    console.log(`${manifestRelPath} is valid.`);
  }
}

if (hasErrors) {
  process.exitCode = 1;
}
