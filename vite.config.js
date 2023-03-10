import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    glsl({
      exclude: undefined,                         // File paths/extensions to ignore
      include: /\.(glsl|wgsl|vert|frag|vs|fs)$/i, // File paths/extensions to import
      defaultExtension: 'glsl',                   // Shader suffix when no extension is specified
      warnDuplicatedImports: true,                // Warn if the same chunk was imported multiple times
      compress: false                             // Compress the resulting shader code
    }),
    svelte()
  ],
  build: {
    outDir: '../dist',
    minify: 'terser',
    assetsDir: 'assets',
    rollupOptions: {
        output: {
            entryFileNames: '[name]-[hash].js',
            chunkFileNames: '[name]-[hash].js',
            assetFileNames: (assetInfo) => {
                let extType = path.extname(assetInfo.name);
                if (!/js|css/i.test(extType)) {
                    return `assets/[name][extname]`;
                }
                return '[name]-[hash][extname]';
              }
        }
    }
}
})
