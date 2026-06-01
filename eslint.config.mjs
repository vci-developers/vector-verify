import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import boundaries from 'eslint-plugin-boundaries';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
        ],
    },
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        plugins: { boundaries },
        settings: {
            'boundaries/include': ['src/**/*'],
            'boundaries/elements': [
                {
                    mode: 'full',
                    type: 'shared',
                    pattern: [
                        'src/components/**/*',
                        'src/api/**/*',
                        'src/hooks/**/*',
                        'src/i18n/**/*',
                        'src/lib/**/*',
                        'src/utils/**/*',
                        'src/server/**/*',
                        'src/app/global.d.ts',
                    ],
                },
                {
                    mode: 'full',
                    type: 'feature',
                    capture: ['featureName'],
                    pattern: ['src/features/*/**/*'],
                },
                {
                    mode: 'full',
                    type: 'app',
                    capture: ['_', 'fileName'],
                    pattern: ['src/app/**/*'],
                },
                {
                    mode: 'full',
                    type: 'neverImport',
                    pattern: ['src/*.*', 'src/tasks/**/*'],
                },
            ],
        },

        rules: {
            'boundaries/no-unknown': 'error',
            'boundaries/no-unknown-files': 'error',

            'boundaries/element-types': [
                'error',
                {
                    default: 'disallow',
                    rules: [
                        {
                            from: ['shared'],
                            allow: ['shared'],
                        },
                        {
                            from: ['feature'],
                            allow: [
                                'shared',
                                [
                                    'feature',
                                    { featureName: '${from.featureName}' },
                                ],
                            ],
                        },
                        {
                            from: ['app', 'neverImport'],
                            allow: ['shared', 'feature'],
                        },
                        {
                            from: ['app'],
                            allow: [['app', { fileName: '*.css' }]],
                        },
                    ],
                },
            ],
        },
    },
];

export default eslintConfig;
