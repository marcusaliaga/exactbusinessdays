import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'dist');
const port = process.env.PORT || 4173;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer((req, res) => {
  const urlPath = new URL(req.url, `http://localhost:${port}`).pathname;
  let filePath = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(root, 'index.html');
  res.setHeader('Content-Type', types[path.extname(filePath)] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}).listen(port, () => console.log(`Serving on http://localhost:${port}`));
