import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Custom build directory (optional - defaults to '.next')
  // distDir: 'build',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
