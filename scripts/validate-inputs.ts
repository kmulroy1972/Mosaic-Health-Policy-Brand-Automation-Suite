import fs from 'fs';
import path from 'path';
import process from 'process';

import Ajv, { AnySchema, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

const rootDir = process.cwd();
const configPath = path.resolve(rootDir, 'config', 'inputs.json');
const schemaPath = path.resolve(rootDir, 'config', 'inputs.schema.json');

function readJson(filePath: string): unknown {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Failed to read or parse JSON file at ${filePath}: ${(error as Error).message}`
    );
  }
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) {
    return 'Unknown validation error.';
  }

  return errors
    .map((err) => {
      const instancePath = err.instancePath || '(root)';
      const message = err.message ?? 'is invalid';
      const params = JSON.stringify(err.params);
      return `- ${instancePath} ${message} (${params})`;
    })
    .join('\n');
}

function validateInputs(): void {
  const schema = readJson(schemaPath) as AnySchema;
  const config = readJson(configPath);

  const ajv = new Ajv({
    allErrors: true,
    strict: true
  });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (!valid) {
    const errorMessage = formatErrors(validate.errors);
    console.error('inputs.json failed validation:\n' + errorMessage);
    process.exitCode = 1;
    return;
  }

  console.log('inputs.json is valid.');
}

try {
  validateInputs();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
