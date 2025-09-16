/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

module.exports = {
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  cat > next.config.js <<'JS'
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}
JS
