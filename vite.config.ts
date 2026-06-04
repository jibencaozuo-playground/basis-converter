import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: { open: true, port: 3000 },
  build: { outDir: 'build' }, // mantiene la dir 'build' come CRA (compatibilità Netlify)
});
