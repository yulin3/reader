import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export const useTheme = () => {
  const settingsStore = useSettingsStore()

  const theme = computed(() => settingsStore.theme)
  const isDark = computed(() => theme.value === 'dark')

  const toggleTheme = () => {
    settingsStore.toggleTheme()
  }

  return {
    theme,
    isDark,
    toggleTheme
  }
}