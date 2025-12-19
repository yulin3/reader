import type { Comic, Chapter } from '@/types/comic'
import { saveDirectoryHandle } from './directoryHandleStorage'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']

export const isImageFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return IMAGE_EXTENSIONS.includes(ext)
}

export const sortFiles = (files: string[]): string[] => {
  return [...files].sort((a, b) => {
    const nameA = a.substring(a.lastIndexOf('/') + 1)
    const nameB = b.substring(b.lastIndexOf('/') + 1)
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' })
  })
}

export const scanDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<Comic[]> => {
  const comics: Comic[] = []

  try {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'directory') {
        try {
          const comic = await scanComicDirectory(name, handle as FileSystemDirectoryHandle, dirHandle)
          if (comic && comic.chapters.length > 0) {
            comics.push(comic)
            // 保存目录句柄引用
            try {
              await saveDirectoryHandle(comic.id, dirHandle)
            } catch (error) {
              console.warn('Failed to save directory handle for comic:', comic.id, error)
            }
          } else {
            console.warn(`Comic directory "${name}" has no valid chapters`)
          }
        } catch (error) {
          console.error(`Failed to scan comic directory "${name}":`, error)
        }
      }
    }
  } catch (error) {
    console.error('Failed to scan directory:', error)
    throw error
  }

  return comics.sort((a, b) => a.title.localeCompare(b.title))
}

const scanComicDirectory = async (
  comicName: string,
  dirHandle: FileSystemDirectoryHandle,
  _rootHandle: FileSystemDirectoryHandle
): Promise<Comic | null> => {
  const chapters: Chapter[] = []
  let cover = ''

  try {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'directory') {
        try {
          const chapter = await scanChapterDirectory(name, handle as FileSystemDirectoryHandle)
          if (chapter && chapter.images.length > 0) {
            chapters.push(chapter)
            if (!cover && chapter.images.length > 0) {
              cover = chapter.images[0]
            }
          } else {
            console.warn(`Chapter directory "${name}" in comic "${comicName}" has no valid images`)
          }
        } catch (error) {
          console.error(`Failed to scan chapter directory "${name}" in comic "${comicName}":`, error)
        }
      }
    }
  } catch (error) {
    console.error(`Failed to scan comic directory "${comicName}":`, error)
    throw error
  }

  if (chapters.length === 0) {
    console.warn(`Comic directory "${comicName}" has no valid chapters`)
    return null
  }

  return {
    id: comicName,
    title: comicName,
    cover,
    chapters: chapters.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })),
    scanTime: Date.now()
  }
}

const scanChapterDirectory = async (
  chapterName: string,
  dirHandle: FileSystemDirectoryHandle
): Promise<Chapter | null> => {
  // 先收集文件名和文件句柄
  const fileEntries: Array<{ name: string; handle: FileSystemFileHandle }> = []

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file' && isImageFile(name)) {
      fileEntries.push({ name, handle: handle as FileSystemFileHandle })
    }
  }

  if (fileEntries.length === 0) return null

  // 按文件名排序
  fileEntries.sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  })

  // 按排序后的顺序创建 blob URL
  const images: string[] = []
  for (const entry of fileEntries) {
    try {
      const file = await entry.handle.getFile()
      images.push(URL.createObjectURL(file))
    } catch (error) {
      console.warn(`Failed to load file ${entry.name}:`, error)
    }
  }

  if (images.length === 0) return null

  return {
    name: chapterName,
    path: chapterName,
    images,
    imageCount: images.length
  }
}

export const selectDirectory = async (): Promise<FileSystemDirectoryHandle | null> => {
  if ('showDirectoryPicker' in window) {
    try {
      return await window.showDirectoryPicker()
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to select directory:', error)
      }
      return null
    }
  }
  return null
}

/**
 * 从目录句柄重新加载漫画的图片
 */
export const reloadComicImages = async (
  comicId: string,
  rootHandle: FileSystemDirectoryHandle
): Promise<Comic | null> => {
  try {
    // 查找对应的漫画目录
    for await (const [name, handle] of rootHandle.entries()) {
      if (handle.kind === 'directory' && name === comicId) {
        const comic = await scanComicDirectory(name, handle as FileSystemDirectoryHandle, rootHandle)
        return comic
      }
    }
    return null
  } catch (error) {
    console.error('Failed to reload comic images:', error)
    return null
  }
}

/**
 * 从目录句柄重新加载章节的图片
 */
export const reloadChapterImages = async (
  comicId: string,
  chapterName: string,
  rootHandle: FileSystemDirectoryHandle
): Promise<Chapter | null> => {
  try {
    // 查找对应的漫画目录
    for await (const [name, handle] of rootHandle.entries()) {
      if (handle.kind === 'directory' && name === comicId) {
        const comicDirHandle = handle as FileSystemDirectoryHandle
        // 查找对应的章节目录
        for await (const [chapterNameInDir, chapterHandle] of comicDirHandle.entries()) {
          if (chapterHandle.kind === 'directory' && chapterNameInDir === chapterName) {
            return await scanChapterDirectory(chapterName, chapterHandle as FileSystemDirectoryHandle)
          }
        }
      }
    }
    return null
  } catch (error) {
    console.error('Failed to reload chapter images:', error)
    return null
  }
}