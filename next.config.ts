import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 🔒 Dev Tools solo visibles en desarrollo
  devIndicators: isDev
    ? {
        buildActivity: false, // puedes activarlo si lo deseas
      }
    : false, // desactiva completamente en producción

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
