<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm text-white"
    >
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <button
          class="p-2 hover:bg-white/10 rounded transition-colors"
          @click="$emit('back')"
        >
          <svg
            class="w-6 h-6"
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
        </button>

        <div class="flex items-center gap-2">
          <button
            :disabled="!hasPrevious"
            class="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="$emit('previous')"
          >
            <svg
              class="w-6 h-6"
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
          </button>

          <span class="px-4 text-sm">
            {{ currentPage + 1 }} / {{ totalPages }}
          </span>

          <button
            :disabled="!hasNext"
            class="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="$emit('next')"
          >
            <svg
              class="w-6 h-6"
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
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="hasPreviousChapter"
            class="px-3 py-1 text-sm hover:bg-white/10 rounded transition-colors"
            @click="$emit('previousChapter')"
          >
            上一章
          </button>
          <button
            v-if="hasNextChapter"
            class="px-3 py-1 text-sm hover:bg-white/10 rounded transition-colors"
            @click="$emit('nextChapter')"
          >
            下一章
          </button>
          <button
            class="p-2 hover:bg-white/10 rounded transition-colors"
            @click="$emit('settings')"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  isVisible: boolean
  currentPage: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  hasPreviousChapter: boolean
  hasNextChapter: boolean
}>()

defineEmits<{
  back: []
  previous: []
  next: []
  previousChapter: []
  nextChapter: []
  settings: []
}>()
</script>