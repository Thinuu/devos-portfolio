/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
}

module.exports = nextConfig
