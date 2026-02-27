/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static export — no serverless functions.
  // All AI runs client-side, so there is nothing to run on the server.
  // This avoids the Vercel 250 MB serverless function size limit.
  output: 'export',
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  webpack: (config) => {
    // Prevent bundling Node.js-only ONNX runtime and sharp (Transformers.js uses WASM in browser)
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    }
    return config
  },
}

module.exports = nextConfig
