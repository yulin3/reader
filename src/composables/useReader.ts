import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReaderStore } from '@/stores/reader'
import { useProgressStore } from '@/stores/progress'
import { useComicStore } from '@/stores/comic'
import { preloadImages } from '@/utils/imageLoader'

export const useReader = (comicId: string | (() => string), chapterName: string | (() => string)) => {
  const router = useRouter()
  const readerStore = useReaderStore()
  const progressStore = useProgressStore()
  const comicStore = useComicStore()

  // 支持响应式的 comicId 和 chapterName
  const getComicId = typeof comicId === 'function' ? comicId : () => comicId
  const getChapterName = typeof chapterName === 'function' ? chapterName : () => chapterName

  const comic = computed(() => comicStore.getComicById(getComicId()))
  const chapter = computed(() => {
    const name = getChapterName()
    return comic.value?.chapters.find(c => c.name === name)
  })
  
  // 已加载的章节索引列表（从当前章节开始）
  const loadedChapterIndices = ref<number[]>([])
  const isLoadingNextChapter = ref(false)
  
  // 所有已加载的图片（跨章节）
  const allLoadedImages = computed(() => {
    if (!comic.value) return []
    
    const images: Array<{ src: string; chapterIndex: number; pageIndex: number }> = []
    
    for (const chapterIndex of loadedChapterIndices.value) {
      const ch = comic.value.chapters[chapterIndex]
      if (ch && ch.images.length > 0) {
        ch.images.forEach((src, pageIndex) => {
          images.push({ src, chapterIndex, pageIndex })
        })
      }
    }
    
    return images
  })
  
  // 当前章节的图片（保持向后兼容）
  const images = computed(() => chapter.value?.images || [])
  const currentPageIndex = ref(0)
  const isLoading = ref(false)

  const currentImage = computed(() => {
    return images.value[currentPageIndex.value] || ''
  })
  
  const currentChapterIndex = computed(() => {
    if (!comic.value) return -1
    const name = getChapterName()
    return comic.value.chapters.findIndex(c => c.name === name)
  })
  
  // 当前图片在所有已加载图片中的索引
  const currentGlobalIndex = computed(() => {
    const chapterIdx = currentChapterIndex.value
    if (chapterIdx === -1) return 0
    
    let globalIndex = 0
    for (const chapterIndex of loadedChapterIndices.value) {
      if (chapterIndex < chapterIdx) {
        const ch = comic.value?.chapters[chapterIndex]
        if (ch) {
          globalIndex += ch.images.length
        }
      } else if (chapterIndex === chapterIdx) {
        globalIndex += currentPageIndex.value
        break
      }
    }
    
    return globalIndex
  })

  const hasPreviousPage = computed(() => currentPageIndex.value > 0)
  const hasNextPage = computed(() => currentPageIndex.value < images.value.length - 1)
  
  // 加载下一章的图片
  const loadNextChapter = async () => {
    if (!comic.value || isLoadingNextChapter.value) return false
    
    const currentIdx = currentChapterIndex.value
    if (currentIdx === -1) return false
    
    const nextChapterIndex = currentIdx + 1
    if (nextChapterIndex >= comic.value.chapters.length) return false
    
    // 如果下一章已经加载，不需要重复加载
    if (loadedChapterIndices.value.includes(nextChapterIndex)) {
      return true
    }
    
    isLoadingNextChapter.value = true
    
    try {
      // 确保下一章的图片已加载
      const nextChapter = comic.value.chapters[nextChapterIndex]
      if (nextChapter && nextChapter.images.length === 0) {
        // 需要从目录句柄重新加载图片
        await comicStore.ensureComicImagesLoaded(getComicId())
        // 重新获取漫画数据
        const updatedComic = comicStore.getComicById(getComicId())
        if (updatedComic) {
          const updatedChapter = updatedComic.chapters[nextChapterIndex]
          if (updatedChapter && updatedChapter.images.length > 0) {
            // 添加到已加载列表
            if (!loadedChapterIndices.value.includes(nextChapterIndex)) {
              loadedChapterIndices.value.push(nextChapterIndex)
            }
            return true
          }
        }
        return false
      } else if (nextChapter && nextChapter.images.length > 0) {
        // 图片已存在，直接添加到已加载列表
        if (!loadedChapterIndices.value.includes(nextChapterIndex)) {
          loadedChapterIndices.value.push(nextChapterIndex)
        }
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to load next chapter:', error)
      return false
    } finally {
      isLoadingNextChapter.value = false
    }
  }
  
  // 初始化已加载的章节列表
  const initLoadedChapters = () => {
    const idx = currentChapterIndex.value
    if (idx !== -1 && !loadedChapterIndices.value.includes(idx)) {
      loadedChapterIndices.value = [idx]
    }
  }

  const hasPreviousChapter = computed(() => currentChapterIndex.value > 0)
  const hasNextChapter = computed(() => {
    if (!comic.value) return false
    return currentChapterIndex.value < comic.value.chapters.length - 1
  })

  const previousChapter = computed(() => {
    if (!hasPreviousChapter.value || !comic.value) return null
    return comic.value.chapters[currentChapterIndex.value - 1]
  })

  const nextChapter = computed(() => {
    if (!hasNextChapter.value || !comic.value) return null
    return comic.value.chapters[currentChapterIndex.value + 1]
  })

  const loadProgress = () => {
    const id = getComicId()
    const name = getChapterName()
    const progress = progressStore.getProgress(id)
    if (progress && progress.chapterName === name) {
      currentPageIndex.value = progress.pageIndex
    } else {
      // 如果章节变化了，重置页码
      currentPageIndex.value = 0
    }
  }

  const saveProgress = () => {
    if (!chapter.value) return

    progressStore.updateProgress({
      comicId: getComicId(),
      chapterName: getChapterName(),
      pageIndex: currentPageIndex.value,
      pageName: images.value[currentPageIndex.value] || '',
      lastReadTime: Date.now()
    })
  }

  const preloadNearbyImages = async () => {
    if (images.value.length === 0) return

    const start = Math.max(0, currentPageIndex.value - 10)
    const end = Math.min(images.value.length, currentPageIndex.value + 11)
    const toPreload = images.value.slice(start, end)

    await preloadImages(toPreload)
  }

  const goToPage = (index: number) => {
    if (index >= 0 && index < images.value.length) {
      currentPageIndex.value = index
      saveProgress()
      preloadNearbyImages()
    }
  }

  const goToPreviousPage = () => {
    if (hasPreviousPage.value) {
      goToPage(currentPageIndex.value - 1)
    } else if (hasPreviousChapter.value && previousChapter.value) {
      router.push(`/reader/${getComicId()}/${encodeURIComponent(previousChapter.value.name)}`)
    }
  }

  const goToNextPage = () => {
    if (hasNextPage.value) {
      goToPage(currentPageIndex.value + 1)
    } else if (hasNextChapter.value && nextChapter.value) {
      router.push(`/reader/${getComicId()}/${encodeURIComponent(nextChapter.value.name)}`)
    }
  }

  const goToPreviousChapter = () => {
    if (previousChapter.value) {
      router.push(`/reader/${getComicId()}/${encodeURIComponent(previousChapter.value.name)}`)
    }
  }

  const goToNextChapter = () => {
    if (nextChapter.value) {
      router.push(`/reader/${getComicId()}/${encodeURIComponent(nextChapter.value.name)}`)
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        goToPreviousPage()
        break
      case 'ArrowRight':
        e.preventDefault()
        goToNextPage()
        break
      case 'ArrowUp':
        e.preventDefault()
        goToPreviousPage()
        break
      case 'ArrowDown':
        e.preventDefault()
        goToNextPage()
        break
      case 'Escape':
        router.back()
        break
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY
      const threshold = 50

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            goToPreviousPage()
          } else {
            goToNextPage()
          }
        }
      } else {
        // 垂直滑动
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            goToPreviousPage()
          } else {
            goToNextPage()
          }
        }
      }

      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchend', handleTouchEnd, { once: true })
  }

  // 确保图片已加载
  const ensureImagesLoaded = async () => {
    const id = getComicId()
    if (id) {
      isLoading.value = true
      try {
        await comicStore.ensureComicImagesLoaded(id)
      } catch (error) {
        console.error('Failed to load comic images:', error)
      } finally {
        isLoading.value = false
      }
    }
  }

  // 监听漫画ID和章节变化，重新加载进度和图片
  watch(
    [() => getComicId(), () => getChapterName()],
    async () => {
      await ensureImagesLoaded()
      initLoadedChapters()
      loadProgress()
      preloadNearbyImages()
    }
  )

  onMounted(async () => {
    await ensureImagesLoaded()
    initLoadedChapters()
    loadProgress()
    preloadNearbyImages()
    document.addEventListener('keydown', handleKeyPress)
    readerStore.showToolbar()
  })

  onUnmounted(() => {
    saveProgress()
    document.removeEventListener('keydown', handleKeyPress)
    readerStore.hideToolbar()
  })

  return {
    comic,
    chapter,
    images,
    allLoadedImages,
    currentPageIndex,
    currentImage,
    currentGlobalIndex,
    isLoading,
    isLoadingNextChapter,
    hasPreviousPage,
    hasNextPage,
    hasPreviousChapter,
    hasNextChapter,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    goToPreviousChapter,
    goToNextChapter,
    loadNextChapter,
    handleTouchStart,
    loadProgress
  }
}