import path from 'node:path';
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const distRoot = path.join(repoRoot, 'dist');
const generatedSource = path.join(repoRoot, 'app', 'generated');
const generatedDest = path.join(distRoot, 'generated');

const jquerySource = path.join(repoRoot, 'app', 'js', 'vendor', 'jquery.min.js');
const jqueryMapSource = path.join(repoRoot, 'app', 'js', 'vendor', 'jquery.min.map');
const vendorDest = path.join(distRoot, 'js', 'vendor');

await mkdir(vendorDest, { recursive: true });
await cp(generatedSource, generatedDest, { recursive: true, force: true });
await cp(jquerySource, path.join(vendorDest, 'jquery.min.js'), { force: true });
await cp(jqueryMapSource, path.join(vendorDest, 'jquery.min.map'), { force: true });
