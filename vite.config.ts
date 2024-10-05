import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            outputDir: 'dist/types',
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'msw-scenarios',
            fileName: (format) => `msw-scenarios.${format}.js`,
        },
        rollupOptions: {
            external: ['msw'],
            output: {
                globals: {
                    msw: 'MSW',
                },
            },
        },
    },
});
