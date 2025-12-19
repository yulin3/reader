<template>
  <div class="space-y-2">
    <div
      v-for="chapter in chapters"
      :key="chapter.name"
      class="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
      @click="$emit('select', chapter)"
    >
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h4 class="font-medium text-gray-900 dark:text-gray-100">
            {{ chapter.name }}
          </h4>
          <span
            v-if="isCurrentChapter(chapter.name)"
            class="px-2 py-0.5 rounded bg-blue-600 text-white text-xs"
          >
            阅读中
          </span>
          <span
            v-else-if="isReadChapter(chapter.name)"
            class="px-2 py-0.5 rounded bg-green-600 text-white text-xs"
          >
            已读
          </span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ chapter.imageCount }} 页
          <span
            v-if="getChapterPage(chapter.name) !== undefined"
            class="ml-2"
          >
            · 读到第 {{ getChapterPage(chapter.name)! + 1 }} 页
          </span>
        </p>
      </div>
      <svg
        class="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Chapter } from '@/types/comic'
import { useProgressStore } from '@/stores/progress'

const props = defineProps<{
  chapters: Chapter[]
  comicId: string
  currentChapter?: string
}>()

defineEmits<{
  select: [chapter: Chapter]
}>()

const progressStore = useProgressStore()

const progress = computed(() => progressStore.getProgress(props.comicId))

const isCurrentChapter = (chapterName: string) => {
  return props.currentChapter === chapterName && progress.value?.pageIndex !== undefined
}

const isReadChapter = (chapterName: string) => {
  if (!progress.value) return false
  const chapter = props.chapters.find(c => c.name === chapterName)
  if (!chapter) return false
  return (
    progress.value.chapterName === chapterName &&
    progress.value.pageIndex >= chapter.imageCount - 1
  )
}

const getChapterPage = (chapterName: string): number | undefined => {
  if (!progress.value || progress.value.chapterName !== chapterName) return undefined
  return progress.value.pageIndex
}
</script>