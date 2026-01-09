import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['rbxqxxmrwlegbcdzvgxh.supabase.co'], // Add your Supabase domain
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Environment variable validation (optional, can be enabled)
  // This will validate env vars at build time
  experimental: {
    // Add any experimental features here if needed
  },

  // Headers are now handled by middleware.ts for better control
  // But we can add additional headers here if needed
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
    ]
  },

  // Redirects (if needed)
  async redirects() {
    return []
  },

  // Rewrites (if needed)
  async rewrites() {
    return []
  },
};

export default nextConfig;
