import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Migrated from Create React App. Notes:
//  • envPrefix keeps existing REACT_APP_* variables working (no .env rename).
//  • The esbuild/optimizeDeps loader overrides let Vite parse JSX that lives in
//    .js files (CRA allowed this; plain Vite does not by default).
//  • build.outDir 'build' matches CRA's output dir (already in .gitignore).
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: 'build' },
  envPrefix: ['REACT_APP_', 'VITE_'],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});
