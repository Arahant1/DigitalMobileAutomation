import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: { 
      dangerouslyIgnoreUnhandledErrors: true,
      include: ['specs/**/*.test.ts'],
        /**
         * not to esm ported packages
         */

        exclude : ['dist', '.idea', '.git','cache','**/node_modules/**'],
        coverage: {
            enabled: true,
            provider: 'v8',
            exclude:['**/*.test.ts'],
            all: false,
            thresholds: {
                statements: 98.51,
                branches:95.44,
                functions:96,
                lines:98.51
            },
            reportsDirectory: 'reports/coverage'
        },
        poolOptions: {
            threads: {
                singleThread: true
            }
        }
    }

});