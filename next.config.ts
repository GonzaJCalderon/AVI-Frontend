import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tudominio.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/intervenciones',
        destination: 'http://10.100.1.80:3333/api/intervenciones',
      },
      {
        source: '/api/intervenciones/:id',
        destination: 'http://10.100.1.80:3333/api/intervenciones/:id',
      },
      {
        source: '/api/auth/login',
        destination: 'http://10.100.1.80:3333/api/auth/login',
      },
      {
        source: '/api/auth/refresh',
        destination: 'http://10.100.1.80:3333/api/auth/refresh',
      },
    ];
  },
};

export default withAnalyzer(nextConfig);
