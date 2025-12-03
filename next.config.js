/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Cloudflare R2 - Dominio público
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      // Dominio personalizado de R2 (si se configura)
      ...(process.env.R2_PUBLIC_URL ? [{
        protocol: 'https',
        hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
      }] : []),
    ],
    // Permitir imágenes no optimizadas para R2 si es necesario
    unoptimized: false,
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

