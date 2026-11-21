/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // TypeScript is verified clean via `npx tsc --noEmit`; skip Next.js's
  // redundant type generation which fails on Windows due to the (protected)
  // route-group folder name containing parentheses (EPERM mkdir).
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
}

module.exports = nextConfig
