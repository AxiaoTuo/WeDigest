import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 修复 Jest worker 错误：禁用开发时的类型检查
  typescript: {
    ignoreBuildErrors: false,
  },
  // 优化 SWC 编译
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-checkbox'],
  },
};

export default nextConfig;
