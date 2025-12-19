<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useComicStore } from '@/stores/comic'
import { useProgressStore } from '@/stores/progress'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import { useComicScanner } from '@/composables/useComicScanner'

const comicStore = useComicStore()
const progressStore = useProgressStore()
const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const { scanDataFolder } = useComicScanner()

onMounted(async () => {
  // 首先尝试自动扫描 data 文件夹（只在有保存的句柄时执行，不会触发安全错误）
  try {
    await scanDataFolder()
  } catch (err) {
    console.warn('自动扫描 data 文件夹失败:', err)
  }
  
  // 然后初始化各个 store
  comicStore.init()
  progressStore.init()
  readerStore.init()
  settingsStore.init()
})
</script>