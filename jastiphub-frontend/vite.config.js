import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const frontend = fileURLToPath(new URL('./', import.meta.url));
const dependencies = fileURLToPath(new URL('../node_modules/', import.meta.url));

export default defineConfig({
  root: frontend,
  envDir: false,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    fs: { allow: [frontend, dependencies] },
  },
});
