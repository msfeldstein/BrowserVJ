import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appRoot = path.join(repoRoot, 'app');
const generatedRoot = path.join(appRoot, 'generated');

const read = async (relativePath) =>
  fs.readFile(path.join(repoRoot, relativePath), 'utf8');

const write = async (relativePath, contents) => {
  const absolutePath = path.join(repoRoot, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, contents);
};

const joinSources = async (files) => {
  const chunks = [];
  for (const file of files) {
    const body = await read(file);
    chunks.push(`// ---- ${file} ----\n${body}\n`);
  }
  return chunks.join('\n');
};

const unique = (items) => Array.from(new Set(items));

const toRelativeFromRoot = (absoluteFilePath) =>
  path.relative(repoRoot, absoluteFilePath).replaceAll(path.sep, '/');

const gatherAppSources = async () => {
  const orderedPatterns = [
    'js/_*.js',
    'js/**/_*.js',
    'js/Compositions/**/*.js',
    'js/Effects/**/*.js',
    'js/Signals/**/*.js',
    'js/ui/**/*.js',
    'js/DisableDrop.js',
    'js/Node.js',
    'js/VJSLayer.js',
    'js/VJSLayerMixer.js',
    'js/rgbshift.js',
    'js/utils.js',
    'js/app.js'
  ];

  const files = [];
  for (const pattern of orderedPatterns) {
    const matches = fg
      .sync(pattern, {
        cwd: appRoot,
        absolute: true,
        ignore: ['js/lib/**', 'js/vendor/**', 'generated/**']
      })
      .map(toRelativeFromRoot);
    files.push(...matches);
  }

  return unique(files);
};

const gatherOutputSources = async () =>
  fg
    .sync('output/**/*.js', {
      cwd: appRoot,
      absolute: true
    })
    .map(toRelativeFromRoot);

const gatherLibrarySources = () => [
  'app/js/lib/backbone.js',
  'app/js/lib/jqueryui.min.js',
  'app/js/lib/_V.js',
  'app/js/lib/color.js',
  'app/js/lib/easing.js',
  'app/js/lib/noise.js',
  'app/js/lib/ISFParser.js',
  'app/js/lib/stats.min.js',
  'app/js/lib/threejs.extend.js'
];

const generate = async () => {
  await fs.mkdir(generatedRoot, { recursive: true });

  await build({
    entryPoints: [path.join(repoRoot, 'scripts/three-global-entry.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2019'],
    outfile: path.join(generatedRoot, 'three.global.js'),
    legalComments: 'none'
  });

  const libsBundle = await joinSources(gatherLibrarySources());
  await write('app/generated/libs.bundle.js', libsBundle);

  const appFiles = await gatherAppSources();
  const appBundle = await joinSources(appFiles);
  await write('app/generated/app.bundle.js', appBundle);

  const outputFiles = await gatherOutputSources();
  const outputBundle = await joinSources(outputFiles);
  await write('app/generated/output.bundle.js', outputBundle);
};

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
