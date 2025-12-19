<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-6">
      <button
        class="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        @click="router.push('/')"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回
      </button>

      <div
        v-if="!comic"
        class="text-center py-12"
      >
        <p class="text-gray-500 dark:text-gray-400">
          漫画不存在
        </p>
      </div>

      <div
        v-else
        class="max-w-4xl mx-auto"
      >
        <div class="flex flex-col md:flex-row gap-6 mb-8">
          <div class="flex-shrink-0">
            <img
              :src="comic.cover"
              :alt="comic.title"
              class="w-48 md:w-64 rounded-lg shadow-lg"
            />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {{ comic.title }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              共 {{ comic.chapters.length }} 章
            </p>
            <div
              v-if="continueReadingChapter"
              class="mb-4"
            >
              <Button
                @click="continueReading"
              >
                继续阅读：{{ continueReadingChapter }} (第 {{ continueReadingPage + 1 }} 页)
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            章节列表 ({{ displayedChapters.length }} / {{ comic.chapters.length }})
          </h2>
          <ChapterList
            :chapters="displayedChapters"
            :comic-id="comic.id"
            :current-chapter="continueReadingChapter"
            @select="goToReader"
          />
          
          <!-- 无限滚动触发器 -->
          <div
            v-if="hasMoreChapters || isLoadingChapters"
            ref="loadMoreTrigger"
            class="flex justify-center items-center py-8"
          >
            <div
              v-if="isLoadingChapters"
              class="text-gray-500 dark:text-gray-400"
            >
              加载中...
            </div>
          </div>
          <div
            v-else-if="displayedChapters.length > 0 && displayedChapters.length < comic.chapters.length"
            class="flex justify-center items-center py-8"
          >
            <div class="text-gray-500 dark:text-gray-400">
              已加载全部章节
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useComicStore } from '@/stores/comic'
import { useProgress } from '@/composables/useProgress'
import ChapterList from '@/components/ChapterList.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const route = useRoute()
const comicStore = useComicStore()

const comic = computed(() => comicStore.getComicById(route.params.id as string))

const { continueReadingChapter, continueReadingPage } = useProgress(comic)

// 章节分页相关
const chapterPageSize = 20 // 每页显示的章节数
const currentChapterPage = ref(0)
const isLoadingChapters = ref(false)

const displayedChapters = computed(() => {
  if (!comic.value) return []
  const end = (currentChapterPage.value + 1) * chapterPageSize
  return comic.value.chapters.slice(0, end)
})

const hasMoreChapters = computed(() => {
  if (!comic.value) return false
  return displayedChapters.value.length < comic.value.chapters.length
})

const loadMoreChapters = () => {
  if (isLoadingChapters.value || !hasMoreChapters.value || !comic.value) return
  
  isLoadingChapters.value = true
  
  // 模拟加载延迟，实际可以移除
  setTimeout(() => {
    currentChapterPage.value++
    isLoadingChapters.value = false
  }, 100)
}

const loadMoreTrigger = ref<HTMLElement | null>(null)

// 使用 Intersection Observer 实现无限滚动
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value || observer) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMoreChapters.value && !isLoadingChapters.value) {
        loadMoreChapters()
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

// 监听 loadMoreTrigger 的变化
watch(loadMoreTrigger, (newVal: HTMLElement | null) => {
  if (newVal && hasMoreChapters.value) {
    nextTick(() => {
      setupIntersectionObserver()
    })
  }
})

// 确保图片已加载
const ensureImagesLoaded = async () => {
  const id = route.params.id as string
  if (id) {
    try {
      await comicStore.ensureComicImagesLoaded(id)
    } catch (error) {
      console.error('Failed to load comic images:', error)
    }
  }
}

// 监听 comic 变化，重置分页
watch(comic, async () => {
  await ensureImagesLoaded()
  currentChapterPage.value = 0
  cleanupObserver()
  nextTick(() => {
    setupIntersectionObserver()
  })
})

// 监听路由变化，确保图片已加载
watch(() => route.params.id, async () => {
  await ensureImagesLoaded()
})

const goToReader = (chapter: { name: string }) => {
  router.push(`/reader/${comic.value!.id}/${encodeURIComponent(chapter.name)}`)
}

const continueReading = () => {
  if (continueReadingChapter.value && comic.value) {
    router.push(`/reader/${comic.value.id}/${encodeURIComponent(continueReadingChapter.value)}?page=${continueReadingPage.value}`)
  }
}

onMounted(async () => {
  await comicStore.init()
  await ensureImagesLoaded()
  // 等待 DOM 更新后设置 observer
  nextTick(() => {
    setupIntersectionObserver()
  })
})

onUnmounted(() => {
  cleanupObserver()
})
</script>