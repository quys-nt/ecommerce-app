/**
 * API quản lý hình ảnh: upload, danh sách, đổi tên, xóa.
 * Ảnh lưu tại public/assets/upload/MM/ (MM = tháng 01-12).
 * Chạy: node server/upload-api.mjs (mặc định port 3001)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const UPLOAD_DIR = path.join(ROOT, 'public', 'assets', 'upload');
const PORT = Number(process.env.UPLOAD_API_PORT) || 3001;

const ALLOWED_EXT = new Set(
  ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp'].map((e) => e.toLowerCase())
);

function getMonthFolder() {
  const n = new Date().getMonth() + 1;
  return n < 10 ? `0${n}` : String(n);
}

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function listImages() {
  const result = [];
  try {
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory() && /^\d{2}$/.test(e.name)) {
        const subPath = path.join(UPLOAD_DIR, e.name);
        const files = await fs.readdir(subPath, { withFileTypes: true });
        for (const f of files) {
          if (f.isFile() && f.name[0] !== '.') {
            const rel = `${e.name}/${f.name}`;
            result.push({
              path: rel,
              url: `/assets/upload/${rel}`,
              name: f.name,
              folder: e.name,
            });
          }
        }
      } else if (e.isFile() && e.name[0] !== '.') {
        const ext = path.extname(e.name).slice(1).toLowerCase();
        if (ALLOWED_EXT.has(ext)) {
          result.push({
            path: e.name,
            url: `/assets/upload/${e.name}`,
            name: e.name,
            folder: '',
          });
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  result.sort((a, b) => a.path.localeCompare(b.path));
  return result;
}

async function handleList(res) {
  try {
    const images = await listImages();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ images }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(err.message) }));
  }
}

async function parseMultipart(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
  const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]).trim() : null;
  if (!boundary) return { file: null, error: 'No boundary' };

  const parts = [];
  const b = Buffer.from(`--${boundary}`);
  let start = body.indexOf(b) + b.length;
  while (start < body.length) {
    const end = body.indexOf(b, start);
    const block = end === -1 ? body.subarray(start) : body.subarray(start, end - 2);
    start = end === -1 ? body.length : end + b.length;
    const headerEnd = block.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) continue;
    const headers = block.subarray(0, headerEnd).toString();
    const disposition = headers.match(/Content-Disposition:\s*[^;]*;\s*name="([^"]+)";\s*filename="([^"]*)"/);
    if (disposition) {
      const filename = disposition[2] || 'file';
      const ext = path.extname(filename).slice(1).toLowerCase();
      if (!ALLOWED_EXT.has(ext)) continue;
      parts.push({
        field: disposition[1],
        filename,
        data: block.subarray(headerEnd + 4),
      });
    }
  }
  return { file: parts[0] || null, error: parts.length ? null : 'No file part' };
}

async function handleUpload(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }
  try {
    const { file, error } = await parseMultipart(req);
    if (error || !file) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error || 'No file in request' }));
      return;
    }
    const monthFolder = getMonthFolder();
    const dir = path.join(UPLOAD_DIR, monthFolder);
    await fs.mkdir(dir, { recursive: true });
    const base = path.basename(file.filename, path.extname(file.filename));
    const ext = path.extname(file.filename);
    let name = safeFilename(base) + ext;
    let filePath = path.join(dir, name);
    let counter = 0;
    while (true) {
      try {
        await fs.access(filePath);
        counter++;
        name = `${safeFilename(base)}-${counter}${ext}`;
        filePath = path.join(dir, name);
      } catch {
        break;
      }
    }
    await fs.writeFile(filePath, file.data);
    const rel = `${monthFolder}/${name}`;
    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        path: rel,
        url: `/assets/upload/${rel}`,
        name,
        folder: monthFolder,
      })
    );
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err.message) }));
  }
}

async function parseJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return null;
  }
}

function decodePath(p) {
  return decodeURIComponent(p).replace(/\.\./g, '');
}

async function handleRename(req, res, urlPath) {
  if (req.method !== 'PATCH') {
    res.statusCode = 405;
    res.end();
    return;
  }
  const pathParam = decodePath(urlPath);
  if (!pathParam) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing path' }));
    return;
  }
  try {
    const body = await parseJson(req);
    const newName = body?.newName ? safeFilename(body.newName) : null;
    if (!newName || !path.extname(newName)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid newName' }));
      return;
    }
    const ext = path.extname(newName).slice(1).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Extension not allowed' }));
      return;
    }
    const fullPath = path.join(UPLOAD_DIR, pathParam);
    const dir = path.dirname(fullPath);
    const newPath = path.join(dir, newName);
    await fs.access(fullPath);
    await fs.rename(fullPath, newPath);
    const rel = path.relative(UPLOAD_DIR, newPath).replace(/\\/g, '/');
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        path: rel,
        url: `/assets/upload/${rel}`,
        name: newName,
        folder: path.dirname(rel),
      })
    );
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.statusCode = 404;
    } else {
      res.statusCode = 500;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err.message) }));
  }
}

async function handleDelete(req, res, urlPath) {
  if (req.method !== 'DELETE') {
    res.statusCode = 405;
    res.end();
    return;
  }
  const pathParam = decodePath(urlPath);
  if (!pathParam) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing path' }));
    return;
  }
  try {
    const fullPath = path.join(UPLOAD_DIR, pathParam);
    await fs.access(fullPath);
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not a file' }));
      return;
    }
    await fs.unlink(fullPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.statusCode = 404;
    } else {
      res.statusCode = 500;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err.message) }));
  }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const u = new URL(req.url || '/', `http://localhost`);
  const pathname = u.pathname;

  if (pathname === '/api/images' && req.method === 'GET') {
    await handleList(res);
    return;
  }
  if (pathname === '/api/upload' && req.method === 'POST') {
    await handleUpload(req, res);
    return;
  }
  const imagePathPrefix = '/api/images/';
  if (pathname.startsWith(imagePathPrefix)) {
    const pathParam = pathname.slice(imagePathPrefix.length);
    if (req.method === 'PATCH') {
      await handleRename(req, res, pathParam);
      return;
    }
    if (req.method === 'DELETE') {
      await handleDelete(req, res, pathParam);
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Upload API: http://localhost:${PORT} (upload dir: ${UPLOAD_DIR})`);
});
