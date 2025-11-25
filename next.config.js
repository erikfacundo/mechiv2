/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Agregar dominios remotos si es necesario
    ],
  },
  // Configuración de compilación
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimizaciones adicionales
  swcMinify: true,
  poweredByHeader: false,
  // Excluir scripts del build de Next.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    // Ignorar errores de módulos externos como Mermaid
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { message: /mermaid/ },
      { message: /SlideDER/ },
    ]
    return config
  },
  // Excluir scripts del build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
}

module.exports = nextConfig

