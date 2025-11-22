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
}

module.exports = nextConfig

