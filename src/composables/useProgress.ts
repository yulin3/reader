import { computed } from 'vue'
import { useProgressStore } from '@/stores/progress'
import type { Comic } from '@/types/comic'

export const useProgress = (comic: Comic | undefined) => {
  const progressStore = useProgressStore()

  const progress = computed(() => {
    if (!comic) return undefined
    return progressStore.getProgress(comic.id)
  })

  const progressPercent = computed(() => {
    if (!comic || !progress.value) return 0
    // 简化计算
    const totalPages = comic.chapters.reduce((sum, ch) => sum + ch.imageCount, 0)
    if (totalPages === 0) return 0
    const readPages = progress.value.pageIndex
    return Math.min(100, Math.round((readPages / totalPages) * 100))
  })

  const isRead = computed(() => {
    if (!comic || !progress.value) return false
    const lastChapter = comic.chapters[comic.chapters.length - 1]
    return (
      progress.value.chapterName === lastChapter.name &&
      progress.value.pageIndex >= lastChapter.imageCount - 1
    )
  })

  const isReading = computed(() => {
    return progress.value !== undefined && !isRead.value
  })

  const lastReadTime = computed(() => {
    return progress.value?.lastReadTime
  })

  const continueReadingChapter = computed(() => {
    return progress.value?.chapterName
  })

  const continueReadingPage = computed(() => {
    return progress.value?.pageIndex ?? 0
  })

  return {
    progress,
    progressPercent,
    isRead,
    isReading,
    lastReadTime,
    continueReadingChapter,
    continueReadingPage
  }
}