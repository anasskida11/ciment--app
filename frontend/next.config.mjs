/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ciment-app-production.up.railway.app/api',
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://ciment-app-production.up.railway.app/api/:path*',
      },
    ];
  },
}

export default nextConfig
