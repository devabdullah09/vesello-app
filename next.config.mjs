/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'cdn.vesello.net',
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
  },
  serverExternalPackages: [],
}

export default nextConfig
