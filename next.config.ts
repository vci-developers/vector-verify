import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.vectorcam.org',
                pathname: '/specimens/**',
            },
            {
                protocol: 'https',
                hostname: 'test.api.vectorcam.org',
                pathname: '/specimens/**',
            },
        ],
    },
    env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
        API_BASE_URL: process.env.API_BASE_URL || '',
    },
};

export default withNextIntl(nextConfig);
