import path from 'path';

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    build: {
        outDir: path.resolve(__dirname, '../../dist/packages/react-icons/dist'),
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: (_, entryName) => `${entryName}.js`
        },
        minify: false,
        rollupOptions: {
            output: { preserveModules: true },
            external: isExternal
        }
    }
});
