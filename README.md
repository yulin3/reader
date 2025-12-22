# 漫画阅读器

一个基于 Vue 3 + TypeScript 的本地漫画阅读器 SPA 应用。

## 功能特性

- 📚 漫画列表展示（网格视图）
- 📖 漫画详情页和章节列表
- 👁️ 流畅的阅读器体验
- 📊 阅读进度自动记录
- 📱 响应式设计，支持移动端
- 🌓 暗色/亮色主题切换
- 🎨 可自定义阅读器背景色和亮度
- ⚡ 图片预加载优化

## 技术栈

- Vue 3 (Composition API, `<script setup>`)
- TypeScript
- Tailwind CSS
- Pinia (状态管理)
- Vue Router
- Vite

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 部署到 GitHub Pages

### 自动部署（推荐）

项目已配置 GitHub Actions 工作流，可以自动部署到 GitHub Pages。

#### 步骤：

1. **启用 GitHub Pages（重要！）**
   - 进入 GitHub 仓库页面
   - 点击 **Settings**（设置）标签
   - 在左侧菜单中找到 **Pages**（页面）
   - 在 **Source**（源）部分，选择 **GitHub Actions**
   - 保存设置

   > ⚠️ **注意**：如果看不到 Pages 选项，可能是因为：
   > - 仓库是私有的（需要 GitHub Pro 或组织账户）
   > - 仓库设置中禁用了 Pages 功能
   > - 需要仓库管理员权限

2. **推送代码到 main 分支**
   ```bash
   git push origin main
   ```

3. **等待部署完成**
   - 在仓库的 **Actions** 标签页查看部署进度
   - 如果看到 "Setup Pages" 步骤失败，说明 Pages 还未启用，请返回步骤 1
   - 部署完成后，访问 `https://<你的用户名>.github.io/<仓库名>/`

#### 注意事项：

- 首次部署可能需要几分钟时间
- 如果仓库名称不是 `reader`，base 路径会自动根据仓库名称调整
- 部署后，所有路由都会自动适配正确的 base 路径
- 如果遇到 "Get Pages site failed" 错误，请确保已按照步骤 1 正确启用 GitHub Pages

### 手动部署

如果需要手动部署：

1. **构建项目**
   ```bash
   # 设置 base 路径（替换 <仓库名> 为你的实际仓库名）
   export VITE_BASE_PATH=/<仓库名>/
   pnpm run build
   ```

2. **部署到 gh-pages 分支**
   ```bash
   # 安装 gh-pages（如果还没有）
   npm install -g gh-pages
   
   # 部署
   gh-pages -d dist
   ```

### 自定义域名

如果使用自定义域名：

1. 在 `vite.config.ts` 中设置 `base: '/'`
2. 在仓库根目录创建 `CNAME` 文件，内容为你的域名
3. 在 DNS 设置中添加 CNAME 记录指向 `你的用户名.github.io`

## 使用说明

### 默认漫画数据

应用启动时会自动加载内置的 mock 漫画数据，包括：
- 海贼王
- 火影忍者
- 龙珠
- 进击的巨人
- 鬼灭之刃

### 添加本地漫画

1. 点击"添加漫画"按钮
2. 选择包含漫画的根目录
3. 应用会自动扫描目录结构

### 目录结构要求

```
根目录/
  ├── 漫画名1/
  │   ├── 章节1/
  │   │   ├── 001.jpg
  │   │   ├── 002.jpg
  │   │   └── ...
  │   ├── 章节2/
  │   │   └── ...
  │   └── ...
  ├── 漫画名2/
  └── ...
```

### 支持的图片格式

- jpg / jpeg
- png
- webp
- gif
- bmp

## 阅读器操作

### 键盘快捷键

- `←` / `↑`: 上一页
- `→` / `↓`: 下一页
- `Esc`: 返回详情页

### 触摸手势（移动端）

- 左右滑动：切换章节
- 上下滑动：翻页

### 阅读设置

- 背景色自定义
- 亮度调节
- 自动翻页

## 浏览器兼容性

- Chrome/Edge（推荐，支持 File System Access API）
- Firefox（支持文件选择器）
- Safari（iOS 14+）
- 移动端浏览器

## 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # 可复用组件
│   ├── ui/          # UI 组件
│   ├── ComicCard.vue
│   ├── ChapterList.vue
│   └── ReaderToolbar.vue
├── views/           # 页面组件
│   ├── ListView.vue
│   ├── DetailView.vue
│   └── ReaderView.vue
├── composables/     # 组合式函数
├── stores/          # Pinia 状态管理
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数
└── router/          # 路由配置
```

## 开发说明

所有数据存储在本地 localStorage，不会上传到服务器。

阅读进度会自动保存，下次打开应用时可以继续阅读。