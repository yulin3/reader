<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          我的漫画
        </h1>
        <div class="flex items-center gap-2">
          <Button
            variant="secondary"
            @click="toggleTheme"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="isDark"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </Button>
          <Button
            :disabled="isScanning"
            @click="scanFromDirectory"
          >
            {{ isScanning ? '扫描中...' : '添加漫画' }}
          </Button>
        </div>
      </div>

      <div
        v-if="error"
        class="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded"
      >
        {{ error }}
      </div>

      <div
        v-if="comics.length === 0"
        class="text-center py-12"
      >
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          还没有漫画，点击"添加漫画"按钮开始扫描
        </p>
      </div>

      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <ComicCard
          v-for="comic in comics"
          :key="comic.id"
          :comic="comic"
          @click="goToDetail(comic.id)"
        />
      </div>

      <!-- 无限滚动触发器 -->
      <div
        v-if="hasMore || isLoading"
        ref="loadMoreTrigger"
        class="flex justify-center items-center py-8"
      >
        <div
          v-if="isLoading"
          class="text-gray-500 dark:text-gray-400"
        >
          加载中...
        </div>
      </div>
      <div
        v-else-if="comics.length > 0"
        class="flex justify-center items-center py-8"
      >
        <div class="text-gray-500 dark:text-gray-400">
          已加载全部漫画
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useComicStore } from '@/stores/comic'
import { useComicScanner } from '@/composables/useComicScanner'
import { useTheme } from '@/composables/useTheme'
import ComicCard from '@/components/ComicCard.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const comicStore = useComicStore()
const { isScanning, error, scanFromDirectory } = useComicScanner()
const { isDark, toggleTheme } = useTheme()

const comics = computed(() => comicStore.comics)
const isLoading = computed(() => comicStore.isLoading)
const hasMore = computed(() => comicStore.hasMore)

const loadMoreTrigger = ref<HTMLElement | null>(null)

const goToDetail = (id: string) => {
  router.push(`/detail/${id}`)
}

// 使用 Intersection Observer 实现无限滚动
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value || observer) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore.value && !isLoading.value) {
        comicStore.loadMore()
      }
    },
    {
      root: null,
      rootMargin: '100px', // 提前 100px 开始加载
      threshold: 0.1
    }
  )

  observer.observe(loadMoreTrigger.value)
}

const cleanupObserver = () => {
  if (observer) {
    if (loadMoreTrigger.value) {
      observer.unobserve(loadMoreTrigger.value)
    }
    observer.disconnect()
    observer = null
  }
}

// 监听 loadMoreTrigger 的变化，确保 observer 正确设置
watch(loadMoreTrigger, (newVal: HTMLElement | null) => {
  if (newVal && hasMore.value) {
    nextTick(() => {
      setupIntersectionObserver()
    })
  }
})

onMounted(async () => {
  await comicStore.init()
  // 等待 DOM 更新后设置 observer
  nextTick(() => {
    setupIntersectionObserver()
  })
})

onUnmounted(() => {
  cleanupObserver()
})
</script>