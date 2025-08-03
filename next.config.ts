import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
    reactCompiler: true,
    // ppr: "incremental",
    /* NOTE: PPRは cacheComponents が有効な場合、自動的に有効化される
     * 逆に 両方とも有効にすると競合してエラーになる
     */
  },
}

export default nextConfig
