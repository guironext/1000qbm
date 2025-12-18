import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export disabled - API routes require a server
  // output: 'export',
  
  // Custom build directory (optional - defaults to '.next')
  // distDir: 'build',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Required for static export
    unoptimized: false,
  },
};

export default nextConfig;