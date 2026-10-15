import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderDashboardHTML } from './ui.js';
import { STARTER_TEMPLATES, compileSql, compileMermaid, parseMermaid, parseSqlDdl, compileDbml, calculateTelemetry } from './engine.js';
import { SqlDialect, SchemaDefinition } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large (max 2MB)'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Health check
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'relay',
      uptime: process.uptime(),
      version: '1.0.0'
    });
  }

  // Starter templates
  if (pathname === '/api/templates' && req.method === 'GET') {
    return sendJson(res, 200, {
      templates: Object.keys(STARTER_TEMPLATES).map(key => ({
        key,
        title: STARTER_TEMPLATES[key].title,
        description: STARTER_TEMPLATES[key].description,
        tablesCount: STARTER_TEMPLATES[key].tables.length,
        relationshipsCount: STARTER_TEMPLATES[key].relationships.length
      }))
    });
  }

  // Template by key
  if (pathname.startsWith('/api/templates/') && req.method === 'GET') {
    const key = pathname.replace('/api/templates/', '').trim();
    if (STARTER_TEMPLATES[key]) {
      return sendJson(res, 200, STARTER_TEMPLATES[key]);
    }
    return sendJson(res, 404, { error: `Template '${key}' not found` });
  }

  // Compile schema endpoint
  if (pathname === '/api/compile' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const schema: SchemaDefinition = payload.schema;
      const dialect: SqlDialect = payload.dialect || 'postgres';

      if (!schema || !Array.isArray(schema.tables)) {
        return sendJson(res, 400, { error: 'Invalid schema: tables array is required' });
      }

      const sql = compileSql(schema, dialect);
      const mermaid = compileMermaid(schema);
      const dbml = compileDbml(schema);
      const telemetry = calculateTelemetry(schema);

      return sendJson(res, 200, {
        dialect,
        sql,
        mermaid,
        dbml,
        telemetry
      });
    } catch (err: any) {
      return sendJson(res, 400, { error: err.message || 'Compilation error' });
    }
  }

  // Parse Mermaid endpoint
  if (pathname === '/api/parse-mermaid' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const mermaidCode = typeof payload === 'string' ? payload : (payload.mermaid || payload.code || '');
      if (!mermaidCode || typeof mermaidCode !== 'string') {
        return sendJson(res, 400, { error: 'Mermaid code is required' });
      }
      const schema = parseMermaid(mermaidCode);
      return sendJson(res, 200, schema);
    } catch (err: any) {
      return sendJson(res, 400, { error: err.message || 'Mermaid parsing error' });
    }
  }

  // Parse SQL DDL endpoint
  if (pathname === '/api/parse-sql' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const sqlCode = typeof payload === 'string' ? payload : (payload.sql || payload.code || '');
      if (!sqlCode || typeof sqlCode !== 'string') {
        return sendJson(res, 400, { error: 'SQL DDL code is required' });
      }
      const schema = parseSqlDdl(sqlCode);
      return sendJson(res, 200, schema);
    } catch (err: any) {
      return sendJson(res, 400, { error: err.message || 'SQL DDL parsing error' });
    }
  }

  // Telemetry endpoint
  if (pathname === '/api/metrics' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const schema: SchemaDefinition = payload.schema;
      if (!schema || !Array.isArray(schema.tables)) {
        return sendJson(res, 400, { error: 'Invalid schema: tables array is required' });
      }
      const telemetry = calculateTelemetry(schema);
      return sendJson(res, 200, telemetry);
    } catch (err: any) {
      return sendJson(res, 400, { error: err.message || 'Metrics calculation error' });
    }
  }

  // Logo asset
  if (pathname === '/logo.svg' && req.method === 'GET') {
    const logoPath = path.resolve(__dirname, '../logo.svg');
    if (fs.existsSync(logoPath)) {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      return res.end(fs.readFileSync(logoPath));
    }
  }

  // Frontend Studio UI
  if ((pathname === '/' || pathname === '/index.html') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderDashboardHTML());
  }

  // 404 Not Found
  sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[RELAY] Studio daemon active on http://${HOST}:${PORT}`);
  console.log(`[RELAY] Design language: Skew / Peel Monospace`);
});

