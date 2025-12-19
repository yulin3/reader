import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// GitHub Pages 部署时，base 路径为仓库名称
// 如果仓库名称是 'reader'，则 base 为 '/reader/'
// 本地开发时，base 为 '/'
// 可以通过环境变量 VITE_BASE_PATH 手动设置 base 路径
const getBase = () => {
  // 优先使用环境变量
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH
  }
  // GitHub Actions 构建时自动使用仓库名称
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    return `/${repoName}/`
  }
  // 默认使用根路径（本地开发）
  return '/'
}

export default defineConfig({
  base: getBase(),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})