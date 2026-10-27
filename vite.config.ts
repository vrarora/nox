import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

// webOS loads the app from file://, where module scripts fail. The build is one
// classic IIFE, and the script tag is rewritten to a plain deferred script.
function classicScript(): Plugin {
  return {
    name: 'sill-classic-script',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/, '<script defer src="$1"></script>')
        .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=');
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [preact(), classicScript()],
  build: {
    target: 'chrome132',
    outDir: 'dist',
    emptyOutDir: true,
    modulePreload: false,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
