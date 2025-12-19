import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storage, STORAGE_KEYS } from '@/utils/storage'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'light' | 'dark'>('dark')

  const init = () => {
    const storedTheme = storage.get<'light' | 'dark'>(STORAGE_KEYS.THEME, 'dark')
    setTheme(storedTheme)
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    storage.set(STORAGE_KEYS.THEME, newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  watch(theme, (newTheme) => {
    setTheme(newTheme)
  })

  return {
    theme,
    init,
    setTheme,
    toggleTheme
  }
})