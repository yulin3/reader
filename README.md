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