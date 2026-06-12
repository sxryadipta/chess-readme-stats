/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/card/:username.svg',
        destination: '/api/card/:username',
      },
    ]
  },
}

export default nextConfig