import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' faz os caminhos dos arquivos serem relativos,
// assim o site funciona em qualquer subpasta do GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
