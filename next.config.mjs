/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'cdn.vesello.net',
      'myveselloapp1.b-cdn.net',
      'your-supabase-project.supabase.co',
      'supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
    // Add image optimization settings for better performance
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable image optimization for external CDN to prevent 500 errors
    unoptimized: false,
    // Add loader for external images
    loader: 'default',
  },
  // Configure for large file uploads
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Ensure proper handling of large files
  serverExternalPackages: [],
  // Add headers for better caching and performance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
}

export default nextConfig
