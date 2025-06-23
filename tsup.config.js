import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/client.ts', 'src/server.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  clean: true,
  external: ['react', 'react-dom']
});
