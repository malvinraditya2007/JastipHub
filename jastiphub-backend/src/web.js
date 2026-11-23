import { access } from 'node:fs/promises';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const viteConfig = fileURLToPath(
  new URL('../../jastiphub-frontend/vite.config.js', import.meta.url),
);
const buildDirectory = new URL('../../jastiphub-frontend/dist/', import.meta.url);
const index = fileURLToPath(new URL('index.html', buildDirectory));

export async function mountFrontend(app, server, dev) {
  if (dev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      configFile: viteConfig,
      // Node's watch mode would restart when Vite removes a bundled config file.
      configLoader: 'native',
      server: { middlewareMode: true, hmr: { server } },
    });
    app.use(vite.middlewares);
    return vite;
  }

  await access(index).catch(() => {
    throw new Error('Build frontend belum tersedia. Jalankan npm run build.');
  });
  app.use(express.static(fileURLToPath(buildDirectory), { redirect: false }));
  app.get('/{*path}', (req, res, next) => {
    const acceptsPage = req.get('accept')?.includes('text/html') && req.accepts('html');
    if (extname(req.path) || !acceptsPage) return next();
    res.sendFile(index, { headers: { 'Cache-Control': 'no-cache' } });
  });
}
