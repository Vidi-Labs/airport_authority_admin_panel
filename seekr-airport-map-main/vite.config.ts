import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import path from 'node:path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      ViteImageOptimizer({})
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: "dist",
      ...(mode === "production"
        ? {
            rolldownOptions: {
              output: {
                minify: {
                  compress: {
                    treeshake: {
                      manualPureFunctions: ["console.log"],
                    },
                  },
                },
              },
            },
          }
        : {}),
    },
  };
})
