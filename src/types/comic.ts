export type Chapter = {
  name: string
  path: string
  images: string[]
  imageCount: number
}

export type Comic = {
  id: string
  title: string
  cover: string
  chapters: Chapter[]
  scanTime: number
}

// 用于存储的元数据类型（不包含图片数据）
export type ChapterMetadata = {
  name: string
  path: string
  imageCount: number
}

export type ComicMetadata = {
  id: string
  title: string
  chapters: ChapterMetadata[]
  scanTime: number
  // 标记是否为 mock 数据（用于恢复图片）
  isMock?: boolean
}