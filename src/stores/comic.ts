import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Comic, ComicMetadata } from '@/types/comic'
import { storage, STORAGE_KEYS } from '@/utils/storage'
import { mockComics } from '@/utils/mockData'
import { comicsToMetadata, metadataToComics, comicToMetadata } from '@/utils/comicStorage'
import { getDirectoryHandle, getAllDirectoryHandles } from '@/utils/directoryHandleStorage'
import { reloadComicImages } from '@/utils/fileScanner'

export const useComicStore = defineStore('comic', () => {
  const allComics = ref<Comic[]>([])
  const displayedComics = ref<Comic[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pageSize = ref(20) // 每页显示数量
  const currentPage = ref(0)
  const hasMore = ref(true)

  // 初始化时加载 mock 数据和存储的数据
  const init = async () => {
    // 尝试加载存储的数据
    const storedData = storage.get<ComicMetadata[] | Comic[]>(STORAGE_KEYS.COMICS, [])
    
    if (storedData.length > 0) {
      // 检查是否为旧格式（包含 images 数组的完整 Comic 对象）
      const firstItem = storedData[0] as Comic | ComicMetadata
      const isOldFormat = 'chapters' in firstItem && 
        firstItem.chapters.length > 0 && 
        'images' in firstItem.chapters[0] &&
        Array.isArray(firstItem.chapters[0].images)
      
      if (isOldFormat) {
        // 旧格式：包含图片数据，需要迁移到新格式
        console.log('Migrating old storage format to metadata-only format...')
        const oldComics = storedData as Comic[]
        allComics.value = oldComics
        // 转换为新格式并保存
        const metadata = comicsToMetadata(oldComics)
        storage.set(STORAGE_KEYS.COMICS, metadata)
      } else {
        // 新格式：只有元数据
        const storedMetadata = storedData as ComicMetadata[]
        const restoredComics = metadataToComics(storedMetadata)
        
        // 尝试从目录句柄重新加载图片
        const directoryHandles = await getAllDirectoryHandles()
        const comicsWithImages: Comic[] = []
        
        for (const comic of restoredComics) {
          // 检查是否有图片需要重新加载
          const needsReload = comic.chapters.some(ch => ch.images.length === 0)
          
          if (needsReload) {
            const rootHandle = directoryHandles.get(comic.id)
            if (rootHandle) {
              try {
                const reloadedComic = await reloadComicImages(comic.id, rootHandle)
                if (reloadedComic) {
                  comicsWithImages.push(reloadedComic)
                  continue
                }
              } catch (error) {
                console.warn('Failed to reload images for comic:', comic.id, error)
              }
            }
          }
          
          // 如果无法重新加载，使用恢复的数据（可能图片为空）
          comicsWithImages.push(comic)
        }
        
        allComics.value = comicsWithImages
      }
    } else {
      // 如果没有存储的数据，使用 mock 数据
      allComics.value = mockComics
      // 只存储元数据（不包含图片）
      const metadata = comicsToMetadata(mockComics)
      const saved = storage.set(STORAGE_KEYS.COMICS, metadata)
      if (!saved) {
        console.warn('Failed to save comics to storage. Data will only be kept in memory.')
        error.value = '存储空间不足，数据仅保存在内存中'
      }
    }
    
    // 初始化显示第一页
    loadMore()
  }

  const loadMore = () => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    const start = currentPage.value * pageSize.value
    const end = start + pageSize.value
    const newComics = allComics.value.slice(start, end)

    if (newComics.length > 0) {
      displayedComics.value = [...displayedComics.value, ...newComics]
      currentPage.value++
      hasMore.value = end < allComics.value.length
    } else {
      hasMore.value = false
    }

    isLoading.value = false
  }

  const addComics = async (newComics: Comic[]) => {
    if (newComics.length === 0) return
    
    const existingIds = new Set(allComics.value.map(c => c.id))
    const uniqueComics = newComics.filter(c => !existingIds.has(c.id))
    const existingComics = newComics.filter(c => existingIds.has(c.id))
    
    // 更新已存在的漫画（可能图片已失效，需要更新）
    if (existingComics.length > 0) {
      console.log(`更新 ${existingComics.length} 个已存在的漫画`)
      for (const newComic of existingComics) {
        const index = allComics.value.findIndex(c => c.id === newComic.id)
        if (index !== -1) {
          // 更新漫画数据（特别是图片）
          allComics.value[index] = newComic
          // 如果该漫画在显示列表中，也更新它
          const displayedIndex = displayedComics.value.findIndex(c => c.id === newComic.id)
          if (displayedIndex !== -1) {
            displayedComics.value[displayedIndex] = newComic
          }
        }
      }
    }
    
    // 添加新漫画
    if (uniqueComics.length > 0) {
      console.log(`添加 ${uniqueComics.length} 个新漫画到列表`)
      
      // 合并并排序所有漫画
      allComics.value = [...allComics.value, ...uniqueComics].sort((a, b) => 
        a.title.localeCompare(b.title)
      )
      
      // 将新漫画添加到显示列表
      const displayedIds = new Set(displayedComics.value.map(c => c.id))
      const newDisplayedComics = uniqueComics.filter(c => !displayedIds.has(c.id))
      
      if (newDisplayedComics.length > 0) {
        // 如果当前显示的数量少于 pageSize，直接添加新漫画
        if (displayedComics.value.length < pageSize.value) {
          displayedComics.value = [...displayedComics.value, ...newDisplayedComics]
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, pageSize.value)
          // 更新分页状态
          currentPage.value = Math.ceil(displayedComics.value.length / pageSize.value)
          hasMore.value = displayedComics.value.length < allComics.value.length
        } else {
          // 如果已经显示了足够的漫画，仍然添加新漫画（用户可能会滚动查看）
          displayedComics.value = [...displayedComics.value, ...newDisplayedComics]
            .sort((a, b) => a.title.localeCompare(b.title))
          hasMore.value = displayedComics.value.length < allComics.value.length
        }
        console.log(`已将 ${newDisplayedComics.length} 个新漫画添加到显示列表，当前显示 ${displayedComics.value.length} 个`)
      }
    } else if (existingComics.length > 0) {
      // 如果只是更新了已存在的漫画，确保显示列表不为空
      if (displayedComics.value.length === 0 && allComics.value.length > 0) {
        console.log('显示列表为空，重新加载第一页')
        currentPage.value = 0
        hasMore.value = true
        loadMore()
      }
    }
    
    // 保存到存储
    const metadata = comicsToMetadata(allComics.value)
    const saved = storage.set(STORAGE_KEYS.COMICS, metadata)
    if (!saved) {
      console.warn('Failed to save comics to storage. Data will only be kept in memory.')
      error.value = '存储空间不足，数据仅保存在内存中'
    } else {
      error.value = null
    }
  }

  const getComicById = (id: string): Comic | undefined => {
    return allComics.value.find(c => c.id === id)
  }

  /**
   * 确保漫画的图片已加载（如果图片为空，从目录句柄重新加载）
   */
  const ensureComicImagesLoaded = async (id: string): Promise<Comic | undefined> => {
    const comic = getComicById(id)
    if (!comic) return undefined
    
    // 如果图片已加载，直接返回
    if (!comic.chapters.some(ch => ch.images.length === 0)) {
      return comic
    }
    
    // 尝试从目录句柄重新加载
    const rootHandle = await getDirectoryHandle(id)
    if (rootHandle) {
      try {
        const reloadedComic = await reloadComicImages(id, rootHandle)
        if (reloadedComic) {
          // 更新 store 中的漫画数据
          const index = allComics.value.findIndex(c => c.id === id)
          if (index !== -1) {
            allComics.value[index] = reloadedComic
            // 更新 displayedComics 中对应的漫画
            const displayedIndex = displayedComics.value.findIndex(c => c.id === id)
            if (displayedIndex !== -1) {
              displayedComics.value[displayedIndex] = reloadedComic
            }
            return reloadedComic
          }
        }
      } catch (error) {
        console.warn('Failed to reload images for comic:', id, error)
      }
    }
    
    return comic
  }

  const comicCount = computed(() => allComics.value.length)

  return {
    comics: displayedComics,
    allComics,
    isLoading,
    error,
    hasMore,
    init,
    loadMore,
    addComics,
    getComicById,
    ensureComicImagesLoaded,
    comicCount
  }
})