/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

// Dirección del backend según entorno
const backendURL = isDev
  ? 'http://10.100.1.64:3333'
  : 'https://sistemas.seguridad.mendoza.gov.ar/bavd'; // O lo que uses en prod
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/intervenciones',
        destination: `${backendURL}/api/intervenciones`,
      },
      {
        source: '/api/intervenciones/:path*',
        destination: `${backendURL}/api/intervenciones/:path*`,
      },
      {
        source: '/api/auth/login',
        destination: `${backendURL}/api/auth/login`, // ✅ antes estaba sin /api
      },
      {
        source: '/api/auth/refresh',
        destination: `${backendURL}/api/auth/refresh`, // ✅ igual acá
      },
      {
        source: '/api/auth/:path*',
        destination: `${backendURL}/api/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendURL}/api/:path*`,
      },
    ];
  },
};


export default nextConfig;
