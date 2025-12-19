<template>
  <div
    class="group cursor-pointer"
    @click="$emit('click')"
  >
    <div class="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
      <img
        :src="comic.cover"
        :alt="comic.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-if="progressPercent > 0"
        class="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50"
      >
        <div
          class="h-full bg-blue-600 transition-all"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <div
        v-if="isReading"
        class="absolute top-2 right-2 px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium"
      >
        阅读中
      </div>
      <div
        v-else-if="isRead"
        class="absolute top-2 right-2 px-2 py-1 rounded bg-green-600 text-white text-xs font-medium"
      >
        已读
      </div>
    </div>
    <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
      {{ comic.title }}
    </h3>
    <p
      v-if="lastReadTime"
      class="text-xs text-gray-500 dark:text-gray-400 mt-1"
    >
      {{ formatTime(lastReadTime) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Comic } from '@/types/comic'
import { useProgress } from '@/composables/useProgress'

const props = defineProps<{
  comic: Comic
}>()

defineEmits<{
  click: []
}>()

const { progressPercent, isRead, isReading, lastReadTime } = useProgress(
  props.comic
)

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}
</script>