import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReadingProgress, ReadingHistory } from '@/types/reader'
import { storage, STORAGE_KEYS } from '@/utils/storage'

export const useProgressStore = defineStore('progress', () => {
  const progressMap = ref<Record<string, ReadingProgress>>({})
  const history = ref<ReadingHistory[]>([])

  const init = () => {
    progressMap.value = storage.get<Record<string, ReadingProgress>>(
      STORAGE_KEYS.PROGRESS,
      {}
    )
    history.value = storage.get<ReadingHistory[]>(STORAGE_KEYS.HISTORY, [])
  }

  const updateProgress = (progress: ReadingProgress) => {
    progressMap.value[progress.comicId] = progress
    storage.set(STORAGE_KEYS.PROGRESS, progressMap.value)

    // 更新历史记录
    const historyItem: ReadingHistory = {
      comicId: progress.comicId,
      title: progress.comicId,
      chapterName: progress.chapterName,
      pageIndex: progress.pageIndex,
      lastReadTime: progress.lastReadTime
    }

    const existingIndex = history.value.findIndex(
      h => h.comicId === progress.comicId
    )
    if (existingIndex >= 0) {
      history.value[existingIndex] = historyItem
    } else {
      history.value.unshift(historyItem)
    }

    // 限制历史记录数量
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }

    history.value.sort((a, b) => b.lastReadTime - a.lastReadTime)
    storage.set(STORAGE_KEYS.HISTORY, history.value)
  }

  const getProgress = (comicId: string): ReadingProgress | undefined => {
    return progressMap.value[comicId]
  }

  const getProgressPercent = (comicId: string): number => {
    const progress = progressMap.value[comicId]
    if (!progress) return 0

    // 简化计算：基于章节进度
    // 实际应该基于总页数计算
    return Math.round((progress.pageIndex / 100) * 100)
  }

  const recentHistory = computed(() => {
    return history.value.slice(0, 10)
  })

  return {
    progressMap,
    history,
    init,
    updateProgress,
    getProgress,
    getProgressPercent,
    recentHistory
  }
})