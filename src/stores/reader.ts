import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReaderSettings } from '@/types/reader'
import { storage, STORAGE_KEYS } from '@/utils/storage'

export const useReaderStore = defineStore('reader', () => {
  const currentComicId = ref<string>('')
  const currentChapter = ref<string>('')
  const currentPageIndex = ref<number>(0)
  const isToolbarVisible = ref(false)
  const toolbarTimer = ref<number | null>(null)

  const settings = ref<ReaderSettings>({
    backgroundColor: '#000000',
    brightness: 100,
    autoTurnPage: false,
    autoTurnInterval: 5
  })

  const init = () => {
    const storedSettings = storage.get<ReaderSettings>(
      STORAGE_KEYS.SETTINGS,
      settings.value
    )
    settings.value = { ...settings.value, ...storedSettings }
  }

  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    storage.set(STORAGE_KEYS.SETTINGS, settings.value)
  }

  const showToolbar = () => {
    isToolbarVisible.value = true
    if (toolbarTimer.value) {
      clearTimeout(toolbarTimer.value)
    }
    toolbarTimer.value = window.setTimeout(() => {
      isToolbarVisible.value = false
    }, 3000)
  }

  const hideToolbar = () => {
    isToolbarVisible.value = false
    if (toolbarTimer.value) {
      clearTimeout(toolbarTimer.value)
      toolbarTimer.value = null
    }
  }

  const toggleToolbar = () => {
    if (isToolbarVisible.value) {
      hideToolbar()
    } else {
      showToolbar()
    }
  }

  return {
    currentComicId,
    currentChapter,
    currentPageIndex,
    isToolbarVisible,
    settings,
    init,
    updateSettings,
    showToolbar,
    hideToolbar,
    toggleToolbar
  }
})