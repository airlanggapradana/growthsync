import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  const server = http.createServer(async (req, res) => {
    const url = req.url || '';
    const pathname = url.split('?')[0];

    // Serve API routes
    if (pathname.startsWith('/api/')) {
      let matched = null;

      if (pathname === '/api/analyze-questionnaire') {
        matched = { file: './api/analyze-questionnaire.js', params: {} };
      } else if (pathname === '/api/translate-analysis') {
        matched = { file: './api/translate-analysis.js', params: {} };
      } else if (pathname === '/api/nearby-puskesmas') {
        matched = { file: './api/nearby-puskesmas.js', params: {} };
      } else if (pathname === '/api/wilayah/provinces') {
        matched = { file: './api/wilayah/provinces.js', params: {} };
      } else {
        const regencyMatch = pathname.match(/^\/api\/wilayah\/regencies\/([^/]+)$/);
        if (regencyMatch) {
          matched = { file: './api/wilayah/regencies/[provinceId].js', params: { provinceId: regencyMatch[1] } };
        } else {
          const districtMatch = pathname.match(/^\/api\/wilayah\/districts\/([^/]+)$/);
          if (districtMatch) {
            matched = { file: './api/wilayah/districts/[regencyId].js', params: { regencyId: districtMatch[1] } };
          } else {
            const villageMatch = pathname.match(/^\/api\/wilayah\/villages\/([^/]+)$/);
            if (villageMatch) {
              matched = { file: './api/wilayah/villages/[districtId].js', params: { districtId: villageMatch[1] } };
            }
          }
        }
      }

      if (matched) {
        try {
          // Parse Query params
          const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const query = {};
          for (const [key, value] of parsedUrl.searchParams.entries()) {
            query[key] = value;
          }

          // Parse Body if POST
          let body = {};
          if (req.method === 'POST') {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();
            if (data && req.headers['content-type']?.includes('application/json')) {
              try {
                body = JSON.parse(data);
              } catch (e) {
                console.error('Failed to parse json body:', e);
              }
            }
          }

          // Mock req/res properties
          req.query = { ...query, ...matched.params };
          req.body = body;

          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
          res.send = (data) => {
            res.end(data);
          };

          const modulePath = path.resolve(process.cwd(), matched.file);
          const { default: handler } = await import(`${modulePath}?update=${Date.now()}`);
          await handler(req, res);
          return;
        } catch (err) {
          console.error(`Error in serverless handler ${matched.file}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
          return;
        }
      }
    }

    // Default to Vite dev server middlewares
    vite.middlewares(req, res);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Development server running on http://localhost:${PORT}`);
  });
}

startDevServer();
