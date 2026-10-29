import {readFileSync} from 'node:fs';
import path from 'node:path';

// Minimal .env loader. Never overwrite operator-provided environment values.
export function loadEnv() {
  let source: string;
  try {source = readFileSync(path.join(process.cwd(), '.env'), 'utf8');} catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}
