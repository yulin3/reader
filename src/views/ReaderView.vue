<template>
  <div
    ref="scrollContainer"
    class="fixed inset-0 bg-black overflow-auto"
    :style="{ backgroundColor: readerStore.settings.backgroundColor }"
    @mousemove="handleMouseMove"
    @click="handleClick"
    @touchstart="handleTouchStart"
  >
    <ReaderToolbar
      :is-visible="readerStore.isToolbarVisible"
      :current-page="currentGlobalIndex + 1"
      :total-pages="allLoadedImages.length"
      :has-previous="hasPreviousPage"
      :has-next="hasNextPage"
      :has-previous-chapter="hasPreviousChapter"
      :has-next-chapter="hasNextChapter"
      @back="goBack"
      @previous="goToPreviousPage"
      @next="goToNextPage"
      @previous-chapter="goToPreviousChapter"
      @next-chapter="goToNextChapter"
      @settings="showSettings = true"
    />

    <div
      class="flex flex-col items-center min-h-full py-4"
      :style="{ filter: `brightness(${readerStore.settings.brightness}%)` }"
    >
      <div
        v-for="(imageData, index) in allLoadedImages"
        :key="`${imageData.chapterIndex}-${imageData.pageIndex}`"
        :ref="el => setImageRef(el, index)"
        class="w-full flex justify-center mb-4"
      >
        <img
          :src="imageData.src"
          :alt="`第 ${index + 1} 页`"
          class="max-w-full h-auto"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>
      
      <!-- 加载指示器 -->
      <div
        v-if="isLoadingNextChapter"
        ref="loadingIndicator"
        class="flex items-center justify-center py-8 text-gray-400"
      >
        <p>加载下一章中...</p>
      </div>
      
      <!-- 空状态 -->
      <div
        v-if="allLoadedImages.length === 0 && !isLoading"
        class="flex items-center justify-center h-full text-gray-400"
      >
        <p>加载中...</p>
      </div>
    </div>

    <!-- 设置面板 -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showSettings"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        @click.self="showSettings = false"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          @click.stop
        >
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            阅读设置
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                背景颜色
              </label>
              <input
                v-model="backgroundColor"
                type="color"
                class="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                @change="updateBackgroundColor"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                亮度: {{ brightness }}%
              </label>
              <input
                v-model.number="brightness"
                type="range"
                min="0"
                max="100"
                class="w-full"
                @input="updateBrightness"
              />
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="autoTurnPage"
                type="checkbox"
                id="autoTurn"
                class="w-4 h-4"
                @change="updateAutoTurnPage"
              />
              <label
                for="autoTurn"
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                自动翻页
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <Button
              @click="showSettings = false"
            >
              关闭
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReader } from '@/composables/useReader'
import { useReaderStore } from '@/stores/reader'
import ReaderToolbar from '@/components/ReaderToolbar.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const readerStore = useReaderStore()

// 使用 computed 使 comicId 和 chapterName 响应式
const comicId = computed(() => route.params.id as string)
const chapterName = computed(() => decodeURIComponent(route.params.chapter as string))

const {
  comic,
  images,
  allLoadedImages,
  currentPageIndex,
  currentImage,
  currentGlobalIndex,
  isLoading,
  isLoadingNextChapter,
  hasPreviousPage,
  hasNextPage,
  hasPreviousChapter,
  hasNextChapter,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  goToPreviousChapter,
  goToNextChapter,
  loadNextChapter,
  handleTouchStart
} = useReader(() => comicId.value, () => chapterName.value)

const scrollContainer = ref<HTMLElement | null>(null)
const loadingIndicator = ref<HTMLElement | null>(null)
const imageRefs = ref<(HTMLElement | null)[]>([])

const setImageRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    imageRefs.value[index] = el
  }
}

const showSettings = ref(false)
const backgroundColor = ref(readerStore.settings.backgroundColor)
const brightness = ref(readerStore.settings.brightness)
const autoTurnPage = ref(readerStore.settings.autoTurnPage)

let autoTurnTimer: number | null = null

const updateBackgroundColor = () => {
  readerStore.updateSettings({ backgroundColor: backgroundColor.value })
}

const updateBrightness = () => {
  readerStore.updateSettings({ brightness: brightness.value })
}

const updateAutoTurnPage = () => {
  readerStore.updateSettings({ autoTurnPage: autoTurnPage.value })
  if (autoTurnPage.value) {
    startAutoTurn()
  } else {
    stopAutoTurn()
  }
}

const startAutoTurn = () => {
  stopAutoTurn()
  autoTurnTimer = window.setInterval(() => {
    if (hasNextPage.value) {
      goToNextPage()
    } else if (hasNextChapter.value) {
      goToNextChapter()
    } else {
      stopAutoTurn()
    }
  }, readerStore.settings.autoTurnInterval * 1000)
}

const stopAutoTurn = () => {
  if (autoTurnTimer) {
    clearInterval(autoTurnTimer)
    autoTurnTimer = null
  }
}

const handleMouseMove = () => {
  readerStore.showToolbar()
}

const handleClick = () => {
  readerStore.showToolbar()
}

const handleImageLoad = () => {
  // 图片加载完成
}

const handleImageError = () => {
  console.error('Failed to load image')
}

// Intersection Observer 用于监听滚动到底部
let intersectionObserver: IntersectionObserver | null = null
// Intersection Observer 用于监听当前可见的图片
let imageObserver: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
  
  if (!loadingIndicator.value) return
  
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingNextChapter.value) {
          // 滚动到底部，加载下一章
          loadNextChapter()
        }
      })
    },
    {
      root: scrollContainer.value,
      rootMargin: '200px', // 提前 200px 开始加载
      threshold: 0.1
    }
  )
  
  intersectionObserver.observe(loadingIndicator.value)
}

// 设置图片可见性观察器，用于更新当前页码
const setupImageObserver = () => {
  if (imageObserver) {
    imageObserver.disconnect()
  }
  
  if (!scrollContainer.value || imageRefs.value.length === 0) return
  
  imageObserver = new IntersectionObserver(
    (entries) => {
      // 找到最接近视口中心的图片
      let maxIntersectionRatio = 0
      let mostVisibleIndex = -1
      
      entries.forEach((entry) => {
        if (entry.intersectionRatio > maxIntersectionRatio) {
          maxIntersectionRatio = entry.intersectionRatio
          const index = imageRefs.value.findIndex(ref => ref === entry.target)
          if (index !== -1) {
            mostVisibleIndex = index
          }
        }
      })
      
      if (mostVisibleIndex !== -1 && mostVisibleIndex < allLoadedImages.value.length) {
        const imageData = allLoadedImages.value[mostVisibleIndex]
        // 如果当前可见的图片属于不同的章节，更新路由和页码
        const currentChapterName = chapterName.value
        const currentChapter = comic.value?.chapters[imageData.chapterIndex]
        
        if (currentChapter && currentChapter.name !== currentChapterName) {
          // 切换到新章节
          router.replace({
            path: `/reader/${comicId.value}/${encodeURIComponent(currentChapter.name)}`,
            query: { page: imageData.pageIndex.toString() }
          })
        } else if (currentChapter && currentChapter.name === currentChapterName) {
          // 同一章节内，更新页码
          if (imageData.pageIndex !== currentPageIndex.value) {
            goToPage(imageData.pageIndex)
          }
        }
      }
    },
    {
      root: scrollContainer.value,
      rootMargin: '-20% 0px -20% 0px', // 只考虑视口中心 60% 的区域
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    }
  )
  
  // 观察所有图片
  imageRefs.value.forEach((ref) => {
    if (ref) {
      imageObserver?.observe(ref)
    }
  })
}

// 滚动到当前图片位置
const scrollToCurrentImage = async () => {
  await nextTick()
  const globalIndex = currentGlobalIndex.value
  if (imageRefs.value[globalIndex]) {
    imageRefs.value[globalIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const goBack = () => {
  router.push(`/detail/${comicId.value}`)
}

// 监听路由变化，恢复页码
watch(
  () => route.query.page,
  (page) => {
    if (page) {
      const pageIndex = parseInt(page as string, 10)
      if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < images.value.length) {
        goToPage(pageIndex)
        scrollToCurrentImage()
      }
    }
  },
  { immediate: true }
)

// 监听已加载图片变化，设置 Intersection Observer
watch(
  () => [allLoadedImages.value.length, isLoadingNextChapter.value],
  async () => {
    await nextTick()
    setupIntersectionObserver()
    setupImageObserver()
  },
  { immediate: true }
)

// 监听图片引用变化，更新观察器
watch(
  () => imageRefs.value.length,
  async () => {
    await nextTick()
    setupImageObserver()
  }
)

// 监听当前页码变化，滚动到对应位置
watch(
  () => currentGlobalIndex.value,
  () => {
    scrollToCurrentImage()
  }
)

// 监听路由变化，更新 store
watch(
  [comicId, chapterName],
  ([id, name]) => {
    readerStore.currentComicId = id
    readerStore.currentChapter = name
  },
  { immediate: true }
)

onMounted(async () => {
  if (autoTurnPage.value) {
    startAutoTurn()
  }
  
  await nextTick()
  setupIntersectionObserver()
  scrollToCurrentImage()
})

onUnmounted(() => {
  stopAutoTurn()
  readerStore.hideToolbar()
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
  if (imageObserver) {
    imageObserver.disconnect()
    imageObserver = null
  }
})
</script>