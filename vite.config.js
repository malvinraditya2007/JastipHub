import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const frontend = fileURLToPath(new URL('./jastiphub-frontend/', import.meta.url));
const dependencies = fileURLToPath(new URL('./node_modules/', import.meta.url));

export default defineConfig({
  root: frontend,
  envDir: false,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../assets',
    assetsDir: 'bundles',
    emptyOutDir: true,
  },
  server: {
    fs: { allow: [frontend, dependencies] },
  },
});
