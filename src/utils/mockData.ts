import type { Comic } from '@/types/comic'

// 创建占位图片 URL（使用 data URI 或 placeholder 服务）
const createPlaceholderImage = (width: number, height: number, text: string): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#9ca3af'
    ctx.font = '24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
  }
  
  return canvas.toDataURL()
}

// 生成章节图片
const generateChapterImages = (chapterName: string, count: number): string[] => {
  return Array.from({ length: count }, (_, i) => {
    const pageNum = String(i + 1).padStart(3, '0')
    return createPlaceholderImage(800, 1200, `${chapterName}\n第 ${pageNum} 页`)
  })
}

// Mock 漫画数据
export const mockComics: Comic[] = [
  {
    id: 'one-piece',
    title: '海贼王',
    cover: createPlaceholderImage(400, 600, '海贼王\n封面'),
    chapters: [
      {
        name: '第1话 冒险的开始',
        path: 'chapter-1',
        images: generateChapterImages('第1话', 20),
        imageCount: 20
      },
      {
        name: '第2话 路飞登场',
        path: 'chapter-2',
        images: generateChapterImages('第2话', 18),
        imageCount: 18
      },
      {
        name: '第3话 索隆加入',
        path: 'chapter-3',
        images: generateChapterImages('第3话', 22),
        imageCount: 22
      }
    ],
    scanTime: Date.now() - 86400000
  },
  {
    id: 'naruto',
    title: '火影忍者',
    cover: createPlaceholderImage(400, 600, '火影忍者\n封面'),
    chapters: [
      {
        name: '第1话 漩涡鸣人',
        path: 'chapter-1',
        images: generateChapterImages('第1话', 19),
        imageCount: 19
      },
      {
        name: '第2话 木叶村',
        path: 'chapter-2',
        images: generateChapterImages('第2话', 21),
        imageCount: 21
      },
      {
        name: '第3话 佐助',
        path: 'chapter-3',
        images: generateChapterImages('第3话', 20),
        imageCount: 20
      }
    ],
    scanTime: Date.now() - 172800000
  },
  {
    id: 'dragon-ball',
    title: '龙珠',
    cover: createPlaceholderImage(400, 600, '龙珠\n封面'),
    chapters: [
      {
        name: '第1话 悟空登场',
        path: 'chapter-1',
        images: generateChapterImages('第1话', 17),
        imageCount: 17
      },
      {
        name: '第2话 寻找龙珠',
        path: 'chapter-2',
        images: generateChapterImages('第2话', 19),
        imageCount: 19
      },
      {
        name: '第3话 布尔玛',
        path: 'chapter-3',
        images: generateChapterImages('第3话', 18),
        imageCount: 18
      }
    ],
    scanTime: Date.now() - 259200000
  },
  {
    id: 'attack-on-titan',
    title: '进击的巨人',
    cover: createPlaceholderImage(400, 600, '进击的巨人\n封面'),
    chapters: [
      {
        name: '第1话 致两千年后的你',
        path: 'chapter-1',
        images: generateChapterImages('第1话', 45),
        imageCount: 45
      },
      {
        name: '第2话 那一天',
        path: 'chapter-2',
        images: generateChapterImages('第2话', 48),
        imageCount: 48
      },
      {
        name: '第3话 绝望的深渊',
        path: 'chapter-3',
        images: generateChapterImages('第3话', 46),
        imageCount: 46
      }
    ],
    scanTime: Date.now() - 345600000
  },
  {
    id: 'demon-slayer',
    title: '鬼灭之刃',
    cover: createPlaceholderImage(400, 600, '鬼灭之刃\n封面'),
    chapters: [
      {
        name: '第1话 炭治郎',
        path: 'chapter-1',
        images: generateChapterImages('第1话', 23),
        imageCount: 23
      },
      {
        name: '第2话 祢豆子',
        path: 'chapter-2',
        images: generateChapterImages('第2话', 25),
        imageCount: 25
      },
      {
        name: '第3话 富冈义勇',
        path: 'chapter-3',
        images: generateChapterImages('第3话', 24),
        imageCount: 24
      }
    ],
    scanTime: Date.now() - 432000000
  }
]
