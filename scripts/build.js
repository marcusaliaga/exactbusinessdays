import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

copyDir(publicDir, dist);
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
fs.mkdirSync(path.join(dist, 'src'), { recursive: true });
for (const file of ['main.js', 'styles.css']) {
  fs.copyFileSync(path.join(root, 'src', file), path.join(dist, 'src', file));
}

console.log('Build complete. Output written to dist.');
