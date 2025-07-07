/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_URL 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`
          : 'http://localhost:3001/v1/:path*',
      },
    ];
  },
  
  // Additional Next.js configuration for better performance
  experimental: {
    optimizePackageImports: ['socket.io-client'],
  },
};

export default nextConfig;
