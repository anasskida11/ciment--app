/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Reduce source maps in production
  productionBrowserSourceMaps: false,
}

export default nextConfig
