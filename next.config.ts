/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Help with sharp compatibility
    serverComponentsExternalPackages: ['sharp']
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      // Handle sharp module loading issues
      config.externals = [...(config.externals || []), 'sharp']
    }
    return config
  }
}

export default nextConfig;
