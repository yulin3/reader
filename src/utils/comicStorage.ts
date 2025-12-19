import type { Comic, ComicMetadata, Chapter, ChapterMetadata } from '@/types/comic'
import { mockComics } from '@/utils/mockData'

/**
 * 将 Comic 转换为 ComicMetadata（移除图片数据）
 */
export const comicToMetadata = (comic: Comic): ComicMetadata => {
  return {
    id: comic.id,
    title: comic.title,
    chapters: comic.chapters.map(chapter => ({
      name: chapter.name,
      path: chapter.path,
      imageCount: chapter.imageCount
    })),
    scanTime: comic.scanTime,
    isMock: mockComics.some(m => m.id === comic.id)
  }
}

/**
 * 将 ComicMetadata 转换回 Comic（恢复图片数据）
 */
export const metadataToComic = (metadata: ComicMetadata): Comic | null => {
  // 如果是 mock 数据，从 mockComics 中恢复图片
  if (metadata.isMock) {
    const mockComic = mockComics.find(m => m.id === metadata.id)
    if (mockComic) {
      // 合并元数据和图片数据
      const chapters: Chapter[] = metadata.chapters.map(metaChapter => {
        const mockChapter = mockComic.chapters.find(c => c.name === metaChapter.name)
        if (mockChapter) {
          return {
            ...metaChapter,
            images: mockChapter.images
          }
        }
        // 如果找不到对应的章节，返回空图片数组
        return {
          ...metaChapter,
          images: []
        }
      })
      
      return {
        id: metadata.id,
        title: metadata.title,
        cover: mockComic.cover,
        chapters,
        scanTime: metadata.scanTime
      }
    }
  }
  
  // 对于扫描的数据，图片 URL 可能已失效
  // 返回一个标记，表示需要重新扫描
  const chapters: Chapter[] = metadata.chapters.map(metaChapter => ({
    ...metaChapter,
    images: [] // 图片需要重新从文件系统加载
  }))
  
  return {
    id: metadata.id,
    title: metadata.title,
    cover: '', // 封面需要重新加载
    chapters,
    scanTime: metadata.scanTime
  }
}

/**
 * 批量转换 Comic 到 ComicMetadata
 */
export const comicsToMetadata = (comics: Comic[]): ComicMetadata[] => {
  return comics.map(comicToMetadata)
}

/**
 * 批量转换 ComicMetadata 到 Comic
 */
export const metadataToComics = (metadataList: ComicMetadata[]): Comic[] => {
  return metadataList
    .map(metadataToComic)
    .filter((comic): comic is Comic => comic !== null)
}

