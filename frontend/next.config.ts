import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
    // Allow localhost in development
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Disable image optimization for localhost in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
